import type { MediaDetails, TmdbSearchResult, CastMember, WatchProviders } from '../types';

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
        console.error("TMDb API Error:", errorData);
        throw new Error(`TMDb API request failed: ${response.statusText}`);
    }
    return response.json();
};

const searchMedia = async (query: string, year: number | null, type: 'movie' | 'tv'): Promise<TmdbSearchResult | null> => {
    let endpoint = `/search/${type}?query=${encodeURIComponent(query)}`;
    if (year) {
        const yearParam = type === 'movie' ? 'primary_release_year' : 'first_air_date_year';
        endpoint += `&${yearParam}=${year}`;
    }
    const data = await fetchFromTmdb<{ results: TmdbSearchResult[] }>(endpoint);
    return data.results.length > 0 ? data.results[0] : null;
};

const getMediaDetails = async (id: number, type: 'movie' | 'tv') => {
    const endpoint = `/${type}/${id}?append_to_response=videos`;
    return fetchFromTmdb<any>(endpoint);
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


export const fetchFullMediaDetails = async (title: string, year: number, type: 'movie' | 'tv'): Promise<MediaDetails | null> => {
    try {
        const searchResult = await searchMedia(title, year, type);
        if (!searchResult) {
            // Fallback: search without year if initial search fails
            const fallbackSearch = await searchMedia(title, null, type);
            if(!fallbackSearch) return null;
            
            const details = await getMediaDetails(fallbackSearch.id, type);
            return formatMediaDetailsFromApiResponse(details, type);
        }

        const details = await getMediaDetails(searchResult.id, type);
        return formatMediaDetailsFromApiResponse(details, type);
    } catch (error) {
        console.error(`Failed to fetch details for ${title} (${year}) from TMDb:`, error);
        
        // Gracefully degrade when TMDb API key is not available or API call fails
        console.warn(`Returning placeholder data for "${title}".`);
        return {
            id: simpleHash(`${title}:${year}:${type}`),
            title: title,
            overview: "Full details for this title are currently unavailable. This feature requires a TMDb API key.",
            posterUrl: `https://picsum.photos/seed/${encodeURIComponent(title)}/500/750`,
            backdropUrl: `https://picsum.photos/seed/${encodeURIComponent(title)}/1280/720`,
            releaseYear: year.toString(),
            rating: 0,
            trailerUrl: null,
            type: type
        };
    }
};

const formatMediaDetailsFromApiResponse = (details: any, type: 'movie' | 'tv'): MediaDetails => {
    const trailer = details.videos?.results.find(
      (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
    );
    
    return {
        id: details.id,
        title: details.title || details.name,
        overview: details.overview,
        posterUrl: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : `https://picsum.photos/500/750?grayscale`,
        backdropUrl: details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : 'https://picsum.photos/1280/720?grayscale',
        releaseYear: (details.release_date || details.first_air_date || 'N/A').substring(0, 4),
        rating: details.vote_average ? parseFloat(details.vote_average.toFixed(1)) : 0,
        trailerUrl: trailer ? `https://www.youtube.com/embed/${trailer.key}` : null,
        type: type
    };
};


const formatMediaListItem = (item: any, typeOverride?: 'movie' | 'tv'): MediaDetails | null => {
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
        type: type,
    };
};

const fetchTmdbList = async (endpoint: string, typeOverride?: 'movie' | 'tv'): Promise<MediaDetails[]> => {
    try {
        const data = await fetchFromTmdb<{ results: any[] }>(endpoint);
        return data.results
            .map(item => formatMediaListItem(item, typeOverride))
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
  
const formatWatchProviders = (providers: any): WatchProviders => {
    const results = providers?.results?.US;
    if (!results) return {};
    return {
        flatrate: results.flatrate,
        rent: results.rent,
        buy: results.buy,
    };
};

const formatRelated = (recommendations: any, currentType: 'movie' | 'tv'): MediaDetails[] => {
    if (!recommendations?.results) return [];
    return recommendations.results
        .slice(0, 10)
        .map((item: any) => formatMediaListItem(item, item.media_type || currentType))
        .filter((item): item is MediaDetails => item !== null && !!item.id);
};
  
  
export const fetchDetailsForModal = async (id: number, type: 'movie' | 'tv'): Promise<Partial<MediaDetails>> => {
      try {
          const endpoint = `/${type}/${id}?append_to_response=videos,credits,watch/providers,recommendations`;
          const details = await fetchFromTmdb<any>(endpoint);
          
          const trailer = details.videos?.results.find(
              (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
          );
  
          return {
              trailerUrl: trailer ? `https://www.youtube.com/embed/${trailer.key}` : null,
              cast: formatCast(details.credits),
              watchProviders: formatWatchProviders(details['watch/providers']),
              related: formatRelated(details.recommendations, type),
          };
  
      } catch (error) {
          console.error(`Failed to fetch modal details for ${type} ID ${id}:`, error);
          return {
              trailerUrl: null,
              cast: [],
              watchProviders: {},
              related: [],
          };
      }
};

export const getTrending = () => fetchTmdbList('/trending/all/week');
export const getPopularMovies = () => fetchTmdbList('/movie/popular', 'movie');
export const getPopularTv = () => fetchTmdbList('/tv/popular', 'tv');
export const getNowPlayingMovies = () => fetchTmdbList('/movie/now_playing', 'movie');