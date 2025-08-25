import type { MediaDetails, TmdbSearchResult, CastMember, Collection, CollectionDetails, LikedItem, DislikedItem, WatchProviders } from '../types.ts';
import { fetchOmdbDetails } from './omdbService.ts';
import { supportedProviders } from './streamingService.ts';


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
        imdbId: details.imdb_id || null,
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
        overview: item.overview || 'No overview available.',
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

const checkIfInTheaters = (releaseDatesData: any, countryCode: string): boolean => {
    if (!releaseDatesData?.results) {
        return false;
    }

    const countryReleases = releaseDatesData.results.find((r: any) => r.iso_3166_1 === countryCode.toUpperCase());
    if (!countryReleases || !countryReleases.release_dates) {
        return false;
    }

    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    const theatricalRelease = countryReleases.release_dates.find((release: any) => release.type === 3 || release.type === 2);
    
    if (theatricalRelease) {
        const releaseDate = new Date(theatricalRelease.release_date);
        return releaseDate >= threeMonthsAgo && releaseDate <= today;
    }

    return false;
};
  
export const fetchDetailsForModal = async (id: number, type: 'movie' | 'tv', countryCode: string): Promise<Partial<MediaDetails>> => {
      try {
          const appendToResponse = 'videos,credits,recommendations,images,watch/providers' + (type === 'movie' ? ',release_dates' : '');
          const endpoint = `/${type}/${id}?append_to_response=${appendToResponse}&include_image_language=en,null`;
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

          const isInTheaters = type === 'movie' ? checkIfInTheaters(details.release_dates, countryCode) : false;
          
          let omdbDetails: Partial<MediaDetails> = {};
          const imdbId = details.imdb_id;
          if (imdbId && type === 'movie') {
              omdbDetails = await fetchOmdbDetails(imdbId);
          }
  
          return {
              trailerUrl: trailer ? `https://www.youtube.com/embed/${trailer.key}` : null,
              logoUrl: logo,
              cast: formatCast(details.credits),
              related: formatRelated(details.recommendations, type),
              watchProviders,
              isInTheaters,
              imdbId: details.imdb_id || null,
              ...omdbDetails,
          };
  
      } catch (error) {
          console.error(`Failed to fetch modal details for ${type} ID ${id}:`, error);
          return {
              trailerUrl: null,
              logoUrl: null,
              cast: [],
              related: [],
              watchProviders: null,
              isInTheaters: false,
              imdbId: null,
              otherRatings: {},
          };
      }
};

export const searchTmdb = async (query: string): Promise<MediaDetails[]> => {
    const endpoint = `/search/multi?query=${encodeURIComponent(query)}`;
    return fetchTmdbList(endpoint);
};

export const getTrending = () => fetchTmdbList('/trending/all/week');
export const getPopularMovies = () => fetchTmdbList('/movie/popular', 'movie');
export const getPopularTv = () => fetchTmdbList('/tv/popular', 'tv');
export const getNowPlayingMovies = () => fetchTmdbList('/movie/now_playing', 'movie');

export const getMovieCollections = async (): Promise<Collection[]> => {
    const popularMovies = await fetchFromTmdb<{ results: any[] }>('/movie/popular?page=1');
    const collectionPromises = popularMovies.results
        .filter(movie => movie.belongs_to_collection)
        .map(movie => fetchFromTmdb<any>(`/collection/${movie.belongs_to_collection.id}`));

    const collectionsData = await Promise.all(collectionPromises);

    const collectionsMap = new Map<number, Collection>();
    collectionsData.forEach(coll => {
        if (coll.id && coll.poster_path && coll.backdrop_path) {
            collectionsMap.set(coll.id, {
                id: coll.id,
                name: coll.name,
                posterUrl: `https://image.tmdb.org/t/p/w500${coll.poster_path}`,
                backdropUrl: `https://image.tmdb.org/t/p/w1280${coll.backdrop_path}`
            });
        }
    });
    return Array.from(collectionsMap.values());
};

export const fetchCollectionDetails = async (id: number): Promise<CollectionDetails> => {
    const details = await fetchFromTmdb<any>(`/collection/${id}`);
    return {
        id: details.id,
        name: details.name,
        overview: details.overview,
        posterUrl: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : 'https://picsum.photos/500/750?grayscale',
        backdropUrl: details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : 'https://picsum.photos/1280/720?grayscale',
        parts: details.parts
            .map((part: any) => formatMediaListItem(part, 'movie'))
            .filter((part: MediaDetails | null): part is MediaDetails => part !== null),
    };
};

export const getMediaByStudio = async (studioId: number): Promise<MediaDetails[]> => {
    const movieEndpoint = `/discover/movie?with_companies=${studioId}&sort_by=popularity.desc`;
    const tvEndpoint = `/discover/tv?with_companies=${studioId}&sort_by=popularity.desc`;

    const [movies, tvShows] = await Promise.all([
        fetchTmdbList(movieEndpoint, 'movie'),
        fetchTmdbList(tvEndpoint, 'tv')
    ]);

    const shorts = movies.filter(m => m.mediaSubType === 'short');
    const regularMovies = movies.filter(m => m.mediaSubType !== 'short');
    
    const combined = [];
    const maxLength = Math.max(regularMovies.length, tvShows.length, shorts.length);
    for (let i = 0; i < maxLength; i++) {
        if (regularMovies[i]) combined.push(regularMovies[i]);
        if (tvShows[i]) combined.push(tvShows[i]);
        if (shorts[i]) combined.push(shorts[i]);
    }
    
    return combined;
};

export const getMediaByNetwork = async (networkId: number): Promise<MediaDetails[]> => {
    const endpoint = `/discover/tv?with_networks=${networkId}&sort_by=popularity.desc`;
    return fetchTmdbList(endpoint, 'tv');
};

export const getRecommendationsFromTastes = async (likes: LikedItem[], dislikes: DislikedItem[]): Promise<MediaDetails[]> => {
    if (likes.length === 0) return [];

    const movieLikes = likes.filter(l => l.type === 'movie');
    const tvLikes = likes.filter(l => l.type === 'tv');

    const recommendationPromises: Promise<MediaDetails[]>[] = [];

    if (movieLikes.length > 0) {
        const seedMovie = movieLikes[Math.floor(Math.random() * movieLikes.length)];
        recommendationPromises.push(fetchTmdbList(`/movie/${seedMovie.id}/recommendations`, 'movie'));
    }

    if (tvLikes.length > 0) {
        const seedTv = tvLikes[Math.floor(Math.random() * tvLikes.length)];
        recommendationPromises.push(fetchTmdbList(`/tv/${seedTv.id}/recommendations`, 'tv'));
    }
    
    if (movieLikes.length > 0 && tvLikes.length === 0) {
        recommendationPromises.push(getPopularTv().then(res => res.slice(0, 10)));
    }
    if (tvLikes.length > 0 && movieLikes.length === 0) {
        recommendationPromises.push(getPopularMovies().then(res => res.slice(0, 10)));
    }
    
    const results = await Promise.all(recommendationPromises);
    const flattened = results.flat();
    
    const dislikedIds = new Set(dislikes.map(d => d.id));
    const likedIds = new Set(likes.map(l => l.id));
    const uniqueRecommendations = new Map<number, MediaDetails>();

    flattened.forEach(item => {
        if (!dislikedIds.has(item.id) && !likedIds.has(item.id) && !uniqueRecommendations.has(item.id)) {
            uniqueRecommendations.set(item.id, item);
        }
    });

    return Array.from(uniqueRecommendations.values()).sort(() => Math.random() - 0.5);
};

export const getMediaByStreamingProvider = async (providerKey: 'disney' | 'netflix' | 'prime', countryCode: string): Promise<MediaDetails[]> => {
    const providerId = supportedProviders.find(p => p.key === providerKey)?.id;
    if (!providerId) return [];
    
    const movieEndpoint = `/discover/movie?with_watch_providers=${providerId}&watch_region=${countryCode}&sort_by=popularity.desc`;
    const tvEndpoint = `/discover/tv?with_watch_providers=${providerId}&watch_region=${countryCode}&sort_by=popularity.desc`;
    
    const [movies, tvShows] = await Promise.all([
        fetchTmdbList(movieEndpoint, 'movie'),
        fetchTmdbList(tvEndpoint, 'tv')
    ]);

    const combined = [];
    const maxLength = Math.max(movies.length, tvShows.length);
    for (let i = 0; i < maxLength; i++) {
        if (movies[i]) combined.push(movies[i]);
        if (tvShows[i]) combined.push(tvShows[i]);
    }
    
    return combined;
};

export const getAvailableWatchProvidersForRegion = async (region: string): Promise<number[]> => {
  try {
    const data = await fetchFromTmdb<{ results: { provider_id: number }[] }>(`/watch/providers/tv?watch_region=${region}`);
    return data.results.map(p => p.provider_id);
  } catch (error) {
    console.error(`Failed to get providers for region ${region}:`, error);
    return [];
  }
};
