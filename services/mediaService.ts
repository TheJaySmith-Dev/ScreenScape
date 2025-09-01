import type { MediaDetails, CastMember, Collection, CollectionDetails, LikedItem, DislikedItem, WatchProviders, StreamingProviderInfo, ActorDetails } from '../types.ts';
import { supportedProviders } from './streamingService.ts';
import { getApiKey } from './apiService.ts';

const API_BASE_URL = 'https://api.themoviedb.org/3';

const fetchFromApi = async <T,>(endpoint: string): Promise<T> => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("TMDb API key is not set. Please add it via the UI.");
    }
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${API_BASE_URL}${endpoint}${separator}api_key=${apiKey}&language=en-US`;
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); 
        console.error("API Error:", JSON.stringify(errorData, null, 2));
        const errorMessage = errorData.status_message || response.statusText || 'Unknown error';
        throw new Error(`API request failed: ${response.status} ${errorMessage}`);
    }
    return response.json();
};

const findBestTrailer = (videos: any[]): any | null => {
    if (!videos || videos.length === 0) return null;

    const candidates = videos.filter(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
    if (candidates.length === 0) return null;

    candidates.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        if (a.official) scoreA += 8;
        if (b.official) scoreB += 8;
        if (a.name && a.name.toLowerCase().includes('original')) scoreA += 4;
        if (b.name && b.name.toLowerCase().includes('original')) scoreB += 4;
        if (a.type === 'Trailer') scoreA += 2;
        if (b.type === 'Trailer') scoreB += 2;
        const dateA = new Date(a.published_at).getTime();
        const dateB = new Date(b.published_at).getTime();
        if (dateA < dateB) {
            scoreA += 1;
        } else if (dateB < dateA) {
            scoreB += 1;
        }
        return scoreB - scoreA;
    });

    return candidates[0];
};


const findBestTextlessPoster = (images: any): string | null => {
    if (!images?.posters || images.posters.length === 0) return null;
    const textlessPosters = images.posters.filter((p: any) => p.iso_639_1 === 'xx' || p.iso_639_1 === null);
    if (textlessPosters.length === 0) return null;
    textlessPosters.sort((a: any, b: any) => b.vote_average - a.vote_average);
    return `https://image.tmdb.org/t/p/w780${textlessPosters[0].file_path}`;
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
    
    const overview = item.overview || 'No overview available.';

    return {
        id: item.id,
        title: item.title || item.name,
        overview,
        posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : `https://picsum.photos/seed/${encodeURIComponent(item.title || item.name)}/500/750`,
        backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : `https://picsum.photos/seed/${encodeURIComponent(item.title || item.name)}/1280/720`,
        releaseYear: (item.release_date || item.first_air_date || 'N/A').substring(0, 4),
        rating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 0,
        trailerUrl: null, // No trailer info in list views, will be fetched on demand
        type: type,
        popularity: item.popularity || 0,
        releaseDate: item.release_date || item.first_air_date,
        mediaSubType: subType,
    };
};

const fetchList = async (endpoint: string, typeOverride?: 'movie' | 'tv', subType?: 'short'): Promise<MediaDetails[]> => {
    try {
        const data = await fetchFromApi<{ results: any[] }>(endpoint);
        return data.results
            .map(item => formatMediaListItem(item, typeOverride, subType))
            .filter((item): item is MediaDetails => item !== null);
    } catch (error) {
        console.error(`Failed to fetch list from endpoint ${endpoint}:`, error);
        throw error;
    }
};

const formatCast = (credits: any): CastMember[] => {
    if (!credits?.cast) return [];
    return credits.cast
      .slice(0, 10) 
      .map((member: any) => ({
        id: member.id,
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
    if (!releaseDatesData?.results) return false;

    const countryReleases = releaseDatesData.results.find((r: any) => r.iso_31_6_1 === countryCode.toUpperCase());
    if (!countryReleases || !countryReleases.release_dates) return false;

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
          const appendToResponse = 'videos,credits,recommendations,images,watch/providers,external_ids' + (type === 'movie' ? ',release_dates' : ',content_ratings');
          const endpoint = `/${type}/${id}?append_to_response=${appendToResponse}&include_image_language=en,null`;
          const details = await fetchFromApi<any>(endpoint);
          
          const baseDetails = formatMediaDetailsFromApiResponse(details, type);
          const textlessPoster = findBestTextlessPoster(details.images);

          const providersData = details['watch/providers']?.results?.[countryCode.toUpperCase()];
          const watchProviders: WatchProviders | null = providersData ? {
              link: providersData.link,
              flatrate: providersData.flatrate,
              rent: providersData.rent,
              buy: providersData.buy,
          } : null;

          const isInTheaters = type === 'movie' ? checkIfInTheaters(details.release_dates, countryCode) : false;
          
          const additionalDetails: Partial<MediaDetails> = {};
          if (type === 'movie') {
              additionalDetails.runtime = details.runtime;
              const usRelease = details.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US');
              if (usRelease?.release_dates?.[0]?.certification) {
                  additionalDetails.rated = usRelease.release_dates[0].certification;
              }
          } else { // type === 'tv'
              additionalDetails.numberOfSeasons = details.number_of_seasons;
              additionalDetails.lastAirDate = details.last_air_date;
              additionalDetails.status = details.status;
              const usRating = details.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US');
              if (usRating?.rating) {
                  additionalDetails.rated = usRating.rating;
              }
          }
  
          const finalDetails = {
              ...baseDetails,
              textlessPosterUrl: textlessPoster,
              cast: formatCast(details.credits),
              related: formatRelated(details.recommendations, type),
              watchProviders,
              isInTheaters,
              imdbId: details.external_ids?.imdb_id || details.imdb_id || baseDetails.imdbId,
              ...additionalDetails,
          };

          return finalDetails;
  
      } catch (error) {
          console.error(`Failed to fetch modal details for ${type} ID ${id}:`, error);
          return {
              trailerUrl: null, cast: [], related: [], watchProviders: null, isInTheaters: false, imdbId: null,
          };
      }
};

export const searchMedia = async (query: string): Promise<MediaDetails[]> => {
    const endpoint = `/search/multi?query=${encodeURIComponent(query)}`;
    return fetchList(endpoint);
};

export const getTrending = () => fetchList('/trending/all/week');
export const getPopularMovies = () => fetchList('/movie/popular', 'movie');
export const getPopularTv = () => fetchList('/tv/popular', 'tv');
export const getNowPlayingMovies = () => fetchList('/movie/now_playing', 'movie');
export const getTopRatedMovies = () => fetchList('/movie/top_rated', 'movie');
export const getTopRatedTv = () => fetchList('/tv/top_rated', 'tv');

export const getComingSoonMedia = async (): Promise<MediaDetails[]> => {
    const today = new Date().toISOString().split('T')[0];
    const inSixMonths = new Date();
    inSixMonths.setMonth(inSixMonths.getMonth() + 6);
    const inSixMonthsStr = inSixMonths.toISOString().split('T')[0];

    const upcomingMoviesEndpoint = `/movie/upcoming?region=US&page=1`;
    const upcomingTvEndpoint = `/discover/tv?sort_by=popularity.desc&first_air_date.gte=${today}&first_air_date.lte=${inSixMonthsStr}&air_date.gte=${today}&air_date.lte=${inSixMonthsStr}&with_original_language=en`;
    
    try {
        const [movies, tvShows] = await Promise.all([
            fetchList(upcomingMoviesEndpoint, 'movie'),
            fetchList(upcomingTvEndpoint, 'tv')
        ]);
        
        const combined = [...movies, ...tvShows];
        const sorted = combined
            .filter(item => item.releaseDate && new Date(item.releaseDate) >= new Date(today))
            .sort((a, b) => {
                const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
                const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
                return dateA - dateB;
            });
        return sorted;
    } catch (error) {
        console.error("Failed to fetch coming soon media:", error);
        return [];
    }
};

export const fetchCollectionDetails = async (id: number): Promise<CollectionDetails> => {
    const details = await fetchFromApi<any>(`/collection/${id}`);
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
        fetchList(movieEndpoint, 'movie'),
        fetchList(tvEndpoint, 'tv')
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
    return fetchList(endpoint, 'tv');
};

export const getRecommendationsFromTastes = async (likes: LikedItem[], dislikes: DislikedItem[]): Promise<MediaDetails[]> => {
    if (likes.length === 0) return [];
    const movieLikes = likes.filter(l => l.type === 'movie');
    const tvLikes = likes.filter(l => l.type === 'tv');
    const recommendationPromises: Promise<MediaDetails[]>[] = [];

    if (movieLikes.length > 0) {
        const seedMovie = movieLikes[Math.floor(Math.random() * movieLikes.length)];
        recommendationPromises.push(fetchList(`/movie/${seedMovie.id}/recommendations`, 'movie'));
    }
    if (tvLikes.length > 0) {
        const seedTv = tvLikes[Math.floor(Math.random() * tvLikes.length)];
        recommendationPromises.push(fetchList(`/tv/${seedTv.id}/recommendations`, 'tv'));
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

export const getMediaByStreamingProvider = async (providerKey: StreamingProviderInfo['key'], countryCode: string): Promise<MediaDetails[]> => {
    const providerId = supportedProviders.find(p => p.key === providerKey)?.id;
    if (!providerId) return [];
    const region = 'US';
    const movieEndpoint = `/discover/movie?with_watch_providers=${providerId}&watch_region=${region}&sort_by=popularity.desc`;
    const tvEndpoint = `/discover/tv?with_watch_providers=${providerId}&watch_region=${region}&sort_by=popularity.desc`;
    const [movies, tvShows] = await Promise.all([
        fetchList(movieEndpoint, 'movie'),
        fetchList(tvEndpoint, 'tv')
    ]);
    const combined = [];
    const maxLength = Math.max(movies.length, tvShows.length);
    for (let i = 0; i < maxLength; i++) {
        if (movies[i]) combined.push(movies[i]);
        if (tvShows[i]) combined.push(tvShows[i]);
    }
    return combined;
};

export const fetchMediaByIds = async (mediaToFetch: { id: number; type: 'movie' | 'tv' }[]): Promise<MediaDetails[]> => {
    const promises = mediaToFetch.map(item =>
        fetchFromApi<any>(`/${item.type}/${item.id}`)
            .then(details => formatMediaDetailsFromApiResponse(details, item.type))
            .catch(err => {
                console.error(`Failed to fetch details for ${item.type} ID ${item.id}:`, err);
                return null;
            })
    );
    const results = await Promise.all(promises);
    return results.filter((item): item is MediaDetails => item !== null);
};

export const fetchMediaByCollectionIds = async (collectionIds: number[]): Promise<MediaDetails[]> => {
    if (!collectionIds || collectionIds.length === 0) {
        return [];
    }
    try {
        const collectionPromises = collectionIds.map(id => fetchCollectionDetails(id));
        const collections = await Promise.all(collectionPromises);
        const allMedia = collections.flatMap(collection => collection.parts);
        const uniqueMedia = Array.from(new Map(allMedia.map(item => [item.id, item])).values());
        return uniqueMedia;
    } catch (error) {
        console.error(`Failed to fetch media for collection IDs ${collectionIds.join(', ')}:`, error);
        throw error;
    }
};

export const fetchActorDetails = async (actorId: number): Promise<ActorDetails> => {
    try {
        const detailsPromise = fetchFromApi<any>(`/person/${actorId}`);
        const creditsPromise = fetchFromApi<any>(`/person/${actorId}/combined_credits`);
        const [details, credits] = await Promise.all([detailsPromise, creditsPromise]);

        const filmography = credits.cast
            .filter((item: any) => item.poster_path)
            .map((item: any) => formatMediaListItem(item))
            .filter((item: MediaDetails | null): item is MediaDetails => item !== null)
            .sort((a: MediaDetails, b: MediaDetails) => (b.popularity ?? 0) - (a.popularity ?? 0))
            .filter((item: MediaDetails, index: number, self: MediaDetails[]) => self.findIndex(t => t.id === item.id) === index)
            .slice(0, 20);

        return {
            id: details.id,
            name: details.name,
            biography: details.biography || 'No biography available.',
            profilePath: details.profile_path ? `https://image.tmdb.org/t/p/h632${details.profile_path}` : `https://picsum.photos/500/750?grayscale`,
            birthday: details.birthday,
            placeOfBirth: details.place_of_birth,
            filmography,
        };
    } catch (error) {
        console.error(`Failed to fetch details for actor ID ${actorId}:`, error);
        throw new Error('Could not fetch actor details.');
    }
};