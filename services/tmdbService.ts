

import type { MediaDetails, TmdbSearchResult, CastMember, Collection, CollectionDetails, LikedItem, DislikedItem, WatchProviders } from '../types.ts';

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = '09b97a49759876f2fde9eadb163edc44';

const fetchFromTmdb = async <T,>(endpoint: string): Promise<T> => {
    if (!TMDB_API_KEY) {
        throw new Error("TMDb API key is not available.");
    }
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${TMDB_API_BASE_URL}${endpoint}${separator}api_key=${TMDB_API_KEY}&language=en-US`;
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to get error details from TMDb
        console.error("TMDb API Error:", JSON.stringify(errorData, null, 2));
        const errorMessage = errorData.status_message || response.statusText || 'Unknown error';
        throw new Error(`TMDb API request failed: ${response.status} ${errorMessage}`);
    }
    return response.json();
};

const searchMedia = async (query: string, type: 'movie' | 'tv'): Promise<TmdbSearchResult | null> => {
    const endpoint = `/search/${type}?query=${encodeURIComponent(query)}`;
    const data = await fetchFromTmdb<{ results: TmdbSearchResult[] }>(endpoint);
    return data.results.length > 0 ? data.results[0] : null;
};

// A simple hash function to generate a numeric ID from a string for placeholder data
const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

export const fetchDetailsById = async (id: number, type: 'movie' | 'tv'): Promise<MediaDetails | null> => {
    try {
        const details = await fetchFromTmdb<any>(`/${type}/${id}?append_to_response=videos`);
        return formatMediaDetailsFromApiResponse(details, type);
    } catch(error) {
        console.error(`Failed to fetch details for ${type} ID ${id} from TMDb:`, error);
        return null;
    }
};

export const fetchDetailsByTitle = async (title: string, type: 'movie' | 'tv'): Promise<MediaDetails | null> => {
    try {
        const searchResult = await searchMedia(title, type);
        if (!searchResult) {
            return null
        }
        return fetchDetailsById(searchResult.id, type);
    } catch (error) {
        console.error(`Failed to fetch details for ${title} from TMDb:`, error);
        
        console.warn(`Returning placeholder data for "${title}".`);
        return {
            id: simpleHash(`${title}:${type}`),
            title: title,
            overview: "Full details for this title are currently unavailable.",
            posterUrl: `https://picsum.photos/seed/${encodeURIComponent(title)}/500/750`,
            backdropUrl: `https://picsum.photos/seed/${encodeURIComponent(title)}/1280/720`,
            releaseYear: 'N/A',
            rating: 0,
            trailerUrl: null,
            logoUrl: null,
            type: type
        };
    }
};

export const searchForFirstMediaResult = async (query: string): Promise<{id: number, type: 'movie' | 'tv', title: string} | null> => {
    const endpoint = `/search/multi?query=${encodeURIComponent(query)}`;
    const data = await fetchFromTmdb<{ results: any[] }>(endpoint);
    const firstResult = data.results.find(r => r.media_type === 'movie' || r.media_type === 'tv');
    if (!firstResult) return null;
    return {
        id: firstResult.id,
        type: firstResult.media_type,
        title: firstResult.title || firstResult.name
    };
}

export const getWatchLink = async (mediaId: number, mediaType: 'movie' | 'tv', countryCode: string): Promise<string | null> => {
    try {
        const providers = await fetchFromTmdb<any>(`/${mediaType}/${mediaId}/watch/providers`);
        const countryProviders = providers?.results?.[countryCode.toUpperCase()];
        return countryProviders?.link || null;
    } catch (error) {
        console.error(`Failed to get watch link for ${mediaType} ID ${mediaId}:`, error);
        return null;
    }
};


const findBestTrailer = (videos: any[]): any | null => {
    if (!videos || videos.length === 0) return null;

    const candidates = videos.filter(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
    if (candidates.length === 0) return null;

    // Sort to find the "best" trailer: official > unofficial, trailer > teaser, newer > older
    candidates.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        if (a.official) scoreA += 4;
        if (b.official) scoreB += 4;
        
        if (a.type === 'Trailer') scoreA += 2;
        if (b.type === 'Trailer') scoreB += 2;
        
        const dateA = new Date(a.published_at).getTime();
        const dateB = new Date(b.published_at).getTime();
        if (dateA > dateB) scoreA += 1;
        else scoreB += 1;

        return scoreB - scoreA; // Sort descending by score
    });

    return candidates[0];
};

const findBestLogo = (images: any): string | null => {
    if (!images?.logos || images.logos.length === 0) return null;

    const logos = images.logos;
    
    // Prioritize English logos, then logos with no language specified, then any logo.
    let targetLogos = logos.filter((logo: any) => logo.iso_639_1 === 'en');
    if (targetLogos.length === 0) {
        targetLogos = logos.filter((logo: any) => logo.iso_639_1 === null || logo.iso_639_1 === 'xx');
    }
    if (targetLogos.length === 0) {
        targetLogos = logos;
    }
    
    // Sort by a preference score: SVG > PNG, higher vote average
    targetLogos.sort((a: any, b: any) => {
        let scoreA = 0;
        let scoreB = 0;
        if (a.file_path.endsWith('.svg')) scoreA += 10;
        if (b.file_path.endsWith('.svg')) scoreB += 10;
        
        scoreA += a.vote_average;
        scoreB += b.vote_average;
        
        return scoreB - scoreA;
    });

    const bestLogo = targetLogos[0];
    return bestLogo ? `https://image.tmdb.org/t/p/w500${bestLogo.file_path}` : null;
};

const formatMediaDetailsFromApiResponse = (details: any, type: 'movie' | 'tv'): MediaDetails => {
    const trailer = findBestTrailer(details.videos?.results);
    
    return {
        id: details.id,
        title: details.title || details.name,
        overview: details.overview,
        posterUrl: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : `https://picsum.photos/500/750?grayscale`,
        backdropUrl: details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : 'https://picsum.photos/1280/720?grayscale',
        releaseYear: (details.release_date || details.first_air_date || 'N/A').substring(0, 4),
        rating: details.vote_average ? parseFloat(details.vote_average.toFixed(1)) : 0,
        trailerUrl: trailer ? `https://www.youtube.com/embed/${trailer.key}` : null,
        type: type,
        popularity: details.popularity || 0,
        releaseDate: details.release_date || details.first_air_date,
        mediaSubType: type === 'movie' && details.runtime <= 40 ? 'short' : undefined,
    };
};


const formatMediaListItem = (item: any, typeOverride?: 'movie' | 'tv', subType?: 'short'): MediaDetails | null => {
    const type = typeOverride || item.media_type;
    if (!type || (type !== 'movie' && type !== 'tv')) {
        return null;
    }

    return {
        id: item.id,
        title: item.title || item.name,
        overview: item.overview,
        posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : `https://picsum.photos/seed/${encodeURIComponent(item.title || item.name)}/500/750`,
        backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : `https://picsum.photos/seed/${encodeURIComponent(item.title || item.name)}/1280/720`,
        releaseYear: (item.release_date || item.first_air_date || 'N/A').substring(0, 4),
        rating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 0,
        trailerUrl: null, // No trailer info in list views, will be fetched on demand
        logoUrl: null, // No logo info in list views
        type: type,
        popularity: item.popularity || 0,
        releaseDate: item.release_date || item.first_air_date,
        mediaSubType: subType,
    };
};

const fetchTmdbList = async (endpoint: string, typeOverride?: 'movie' | 'tv', subType?: 'short'): Promise<MediaDetails[]> => {
    try {
        const data = await fetchFromTmdb<{ results: any[] }>(endpoint);
        return data.results
            .map(item => formatMediaListItem(item, typeOverride, subType))
            .filter((item): item is MediaDetails => 
                item !== null && 
                !!item.posterUrl && 
                item.posterUrl.includes('image.tmdb.org') &&
                !!item.backdropUrl &&
                item.backdropUrl.includes('image.tmdb.org')
            ); // Filter out items without valid poster/backdrop
    } catch (error) {
        console.error(`Failed to fetch list from TMDb endpoint ${endpoint}:`, error);
        return []; // Return empty on error
    }
};

const formatCast = (credits: any): CastMember[] => {
    if (!credits?.cast) return [];
    return credits.cast
      .slice(0, 10) // Limit to top 10 cast members
      .map((member: any) => ({
        name: member.name,
        character: member.character,
        profileUrl: member.profile_path
          ? `https://image.tmdb.org/t/p/w185${member.profile_path}`
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=374151&color=fff&size=185`,
      }));
};
  
const formatRelated = (recommendations: any, currentType: 'movie' | 'tv'): MediaDetails[] => {
    if (!recommendations?.results) return [];
    return recommendations.results
        .slice(0, 10)
        .map((item: any) => formatMediaListItem(item, item.media_type || currentType))
        .filter((item): item is MediaDetails => item !== null && !!item.id);
};
  
  
export const fetchDetailsForModal = async (id: number, type: 'movie' | 'tv', countryCode: string): Promise<Partial<MediaDetails>> => {
      try {
          const endpoint = `/${type}/${id}?append_to_response=videos,credits,recommendations,images,watch/providers&include_image_language=en,null`;
          const details = await fetchFromTmdb<any>(endpoint);
          
          const trailer = findBestTrailer(details.videos?.results);
          const logo = findBestLogo(details.images);

          const providersData = details['watch/providers']?.results?.[countryCode.toUpperCase()];
          const watchProviders: WatchProviders | null = providersData ? {
              link: providersData.link,
              flatrate: providersData.flatrate,
              rent: providersData.rent,
              buy: providersData.buy,
          } : null;
  
          return {
              trailerUrl: trailer ? `https://www.youtube.com/embed/${trailer.key}` : null,
              logoUrl: logo,
              cast: formatCast(details.credits),
              related: formatRelated(details.recommendations, type),
              watchProviders,
          };
  
      } catch (error) {
          console.error(`Failed to fetch modal details for ${type} ID ${id}:`, error);
          return {
              trailerUrl: null,
              logoUrl: null,
              cast: [],
              related: [],
              watchProviders: null,
          };
      }
};

const formatCollection = (collection: any): Collection => ({
    id: collection.id,
    name: collection.name,
    posterUrl: collection.poster_path ? `https://image.tmdb.org/t/p/w500${collection.poster_path}` : `https://picsum.photos/500/750?grayscale`,
    backdropUrl: collection.backdrop_path ? `https://image.tmdb.org/t/p/w1280${collection.backdrop_path}` : 'https://picsum.photos/1280/720?grayscale',
});


const POPULAR_COLLECTION_QUERIES = [
    "The Lord of the Rings Collection",
    "Star Wars Collection",
    "Harry Potter Collection",
    "The Fast and the Furious Collection",
    "The Infinity Saga",
    "James Bond Collection",
    "Jurassic Park Collection",
    "Back to the Future Collection",
    "Mission: Impossible Collection",
    "Toy Story Collection",
    "The Dark Knight Trilogy",
    "Indiana Jones Collection",
    "Pirates of the Caribbean Collection",
    "Ghostbusters Collection",
    "The Hunger Games Collection",
    "John Wick Collection",
    "Mad Max Collection",
    "The Matrix Collection",
    "Alien Collection",
    "Die Hard Collection"
];

const searchForCollection = async (query: string): Promise<any | null> => {
    try {
        const endpoint = `/search/collection?query=${encodeURIComponent(query)}`;
        const data = await fetchFromTmdb<{ results: any[] }>(endpoint);
        // Find the most relevant result (often the first, but check for exact name match)
        const exactMatch = data.results.find(c => c.name.toLowerCase() === query.toLowerCase());
        return exactMatch || (data.results.length > 0 ? data.results[0] : null);
    } catch (error) {
        console.error(`Failed to search for collection "${query}":`, error);
        return null;
    }
};

export const getMovieCollections = async (): Promise<Collection[]> => {
    try {
        const searchPromises = POPULAR_COLLECTION_QUERIES.map(query => searchForCollection(query));
        const searchResults = await Promise.all(searchPromises);

        const validResults = searchResults.filter(result => result !== null);
        
        // Remove duplicates that might arise from different search queries pointing to the same collection
        const uniqueCollections = Array.from(new Map(validResults.map(item => [item.id, item])).values());
        
        return uniqueCollections
          .map(formatCollection)
          .filter(c => c.posterUrl.includes('image.tmdb.org')); // Filter out collections without posters

    } catch (error) {
        console.error("Failed to fetch movie collections:", error);
        return [];
    }
};

export const fetchCollectionDetails = async (id: number): Promise<CollectionDetails> => {
    try {
        const details = await fetchFromTmdb<any>(`/collection/${id}`);
        return {
            id: details.id,
            name: details.name,
            overview: details.overview,
            posterUrl: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : `https://picsum.photos/500/750?grayscale`,
            backdropUrl: details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : 'https://picsum.photos/1280/720?grayscale',
            parts: details.parts
                .slice() // Create a shallow copy to avoid side-effects
                .sort((a: any, b: any) => {
                    const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
                    const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
                     // Handle movies without a release date by pushing them to the end
                    if (dateA === 0 && dateB !== 0) return 1;
                    if (dateA !== 0 && dateB === 0) return -1;
                    return dateA - dateB;
                })
                .map((part: any) => formatMediaListItem(part, 'movie'))
                .filter((item): item is MediaDetails => item !== null),
        };
    } catch(error) {
        console.error(`Failed to fetch details for collection ID ${id}:`, error);
        throw error;
    }
}

export const getTrending = () => fetchTmdbList('/trending/all/week');
export const getPopularMovies = () => fetchTmdbList('/movie/popular', 'movie');
export const getPopularTv = () => fetchTmdbList('/tv/popular', 'tv');
export const getNowPlayingMovies = () => fetchTmdbList('/movie/now_playing', 'movie');

export const getMediaByStudio = async (studioId: number): Promise<MediaDetails[]> => {
    try {
        const totalPagesToFetch = 3;
        const moviePromises: Promise<MediaDetails[]>[] = [];
        const shortPromises: Promise<MediaDetails[]>[] = [];
        const tvPromises: Promise<MediaDetails[]>[] = [];

        for (let i = 1; i <= totalPagesToFetch; i++) {
            // Regular movies (runtime > 40 mins)
            moviePromises.push(fetchTmdbList(`/discover/movie?with_companies=${studioId}&sort_by=popularity.desc&page=${i}&with_runtime.gte=41`, 'movie'));
            // Shorts (runtime <= 40 mins)
            shortPromises.push(fetchTmdbList(`/discover/movie?with_companies=${studioId}&sort_by=popularity.desc&page=${i}&with_runtime.lte=40`, 'movie', 'short'));
            // TV Shows
            tvPromises.push(fetchTmdbList(`/discover/tv?with_companies=${studioId}&sort_by=popularity.desc&page=${i}`, 'tv'));
        }

        const [moviePages, shortPages, tvPages] = await Promise.all([
            Promise.all(moviePromises),
            Promise.all(shortPromises),
            Promise.all(tvPromises)
        ]);
        
        const allMedia = [...moviePages.flat(), ...shortPages.flat(), ...tvPages.flat()];
        
        // Remove duplicates by ID
        const uniqueMedia = Array.from(new Map(allMedia.map(item => [item.id, item])).values());
        
        // Sort all combined media by popularity
        uniqueMedia.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
        
        return uniqueMedia;
    } catch (error) {
        console.error(`Failed to fetch media for studio ID ${studioId}:`, error);
        return [];
    }
};

export const searchTmdb = async (query: string): Promise<MediaDetails[]> => {
    const endpoint = `/search/multi?query=${encodeURIComponent(query)}`;
    try {
        const data = await fetchFromTmdb<{ results: any[] }>(endpoint);
        return data.results
            .map(item => formatMediaListItem(item))
            .filter((item): item is MediaDetails => 
                item !== null && 
                !!item.posterUrl && 
                item.posterUrl.includes('image.tmdb.org') &&
                !!item.backdropUrl &&
                item.backdropUrl.includes('image.tmdb.org')
            );
    } catch (error) {
        console.error(`Failed to search TMDb for "${query}":`, error);
        return [];
    }
};

export const getRecommendationsFromTastes = async (likedItems: LikedItem[], dislikedItems: DislikedItem[]): Promise<MediaDetails[]> => {
    if (likedItems.length === 0) {
        return [];
    }
    
    try {
        const recommendationPromises = likedItems.map(item =>
            fetchTmdbList(`/${item.type}/${item.id}/recommendations`)
        );

        const results = await Promise.all(recommendationPromises);
        const allRecommendations = results.flat();
        
        // Create sets of liked and disliked IDs for efficient filtering
        const likedIds = new Set(likedItems.map(item => item.id));
        const dislikedIds = new Set(dislikedItems.map(item => item.id));

        const uniqueRecommendations = Array.from(new Map(allRecommendations.map(item => [item.id, item])).values())
            .filter(item => !likedIds.has(item.id) && !dislikedIds.has(item.id));
            
        // Shuffle the array to provide variety on each load
        for (let i = uniqueRecommendations.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [uniqueRecommendations[i], uniqueRecommendations[j]] = [uniqueRecommendations[j], uniqueRecommendations[i]];
        }
        
        return uniqueRecommendations.slice(0, 20); // Limit to 20 recommendations
    } catch (error) {
        console.error("Failed to fetch recommendations from TMDb:", error);
        return [];
    }
};