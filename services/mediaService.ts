import type { MediaDetails, CastMember, CrewMember, Collection, CollectionDetails, WatchProviders, StreamingProviderInfo, ActorDetails, GameMovie, GameMedia, GameActor, AiSearchParams, SeasonDetails, Episode, AiCuratedCarousel } from '../types.ts';
import { supportedProviders } from './streamingService.ts';
import { TMDB_API_KEY } from './constants.ts';
import { fetchBoxOffice } from './omdbService.ts';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const entityCache = new Map<string, number>();

// Alias map to handle common ambiguous names and ensure correct ID lookup.
const companyAliasMap: { [key: string]: string } = {
    'marvel': 'marvel studios',
    'disney': 'walt disney pictures',
    'warner bros': 'warner bros. pictures',
    'universal': 'universal pictures',
    'lucasfilm': 'lucasfilm ltd.',
    'star wars': 'lucasfilm ltd.',
    '20th century fox': '20th century studios',
};

const genreMap: { [key: string]: number } = {
    "action": 28, "adventure": 12, "animation": 16, "comedy": 35, "crime": 80,
    "documentary": 99, "drama": 18, "family": 10751, "fantasy": 14, "history": 36,
    "horror": 27, "music": 10402, "mystery": 9648, "romance": 10749,
    "science fiction": 878, "sci-fi": 878, "scifi": 878,
    "tv movie": 10770, "thriller": 53, "war": 10752, "western": 37
};

export const fetchApi = async <T,>(endpoint: string): Promise<T> => {
    const apiKey = TMDB_API_KEY;
    // FIX: Removed comparison to placeholder key 'YOUR_TMDB_API_KEY_V3' which caused a type error because the constant has a real value.
    if (!apiKey) {
        throw new Error("TMDb API key is not set. Please add it to services/constants.ts.");
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

export const findBestTrailer = (videos: any[]): any | null => {
    if (!videos || videos.length === 0) return null;

    const candidates = videos.filter(v => v.site === 'YouTube' && ['Trailer', 'Teaser'].includes(v.type));
    
    if (candidates.length === 0) return null;

    candidates.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        // Type preference: 'Trailer' is better than 'Teaser'
        if (a.type === 'Trailer') scoreA += 4;
        if (b.type === 'Trailer') scoreB += 4;

        // Official status preference
        if (a.official) scoreA += 2;
        if (b.official) scoreB += 2;

        // Recency preference: newer is better
        const dateA = new Date(a.published_at).getTime();
        const dateB = new Date(b.published_at).getTime();
        if (dateA > dateB) {
            scoreA += 1;
        } else if (dateB > dateA) {
            scoreB += 1;
        }
        
        return scoreB - scoreA; // Sort descending by score
    });

    return candidates[0];
};


const findBestTextlessBackdrop = (images: any): string | null => {
    if (!images?.backdrops || images.backdrops.length === 0) return null;
    const textlessBackdrops = images.backdrops.filter((p: any) => p.iso_639_1 === 'xx' || p.iso_639_1 === null);
    if (textlessBackdrops.length === 0) return null;
    textlessBackdrops.sort((a: any, b: any) => b.vote_average - a.vote_average);
    return `https://image.tmdb.org/t/p/w1280${textlessBackdrops[0].file_path}`;
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
        const data = await fetchApi<{ results: any[] }>(endpoint);
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

const formatCrew = (crew: any[]): CrewMember[] => {
    if (!crew) return [];

    const directors = crew.filter(member => member.job === 'Director');
    const producers = crew.filter(member => member.job === 'Producer' || member.job === 'Executive Producer');

    // Use a Map to get unique crew members by ID, prioritizing directors
    const memberMap = new Map<number, any>();
    [...directors, ...producers].forEach(member => {
        if (!memberMap.has(member.id)) {
            memberMap.set(member.id, member);
        } else {
            const existing = memberMap.get(member.id)!;
            // If the new role is 'Director' and the old one wasn't, update it.
            if (existing.job !== 'Director' && member.job === 'Director') {
                memberMap.set(member.id, member);
            }
        }
    });

    // Sort to show directors first, then producers
    const sortedCrew = Array.from(memberMap.values()).sort((a, b) => {
        if (a.job === 'Director' && b.job !== 'Director') return -1;
        if (a.job !== 'Director' && b.job === 'Director') return 1;
        return 0; // Keep original order for same-job types
    });

    return sortedCrew.slice(0, 5) // Limit to 5 key crew members
        .map((member: any) => ({
            id: member.id,
            name: member.name,
            job: member.job,
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

    const countryReleases = releaseDatesData.results.find((r: any) => r && r.iso_3166_1 === countryCode.toUpperCase());
    if (!countryReleases || !countryReleases.release_dates || !Array.isArray(countryReleases.release_dates)) {
        return false;
    }

    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    // Find the theatrical release. Type 3 is Theatrical, Type 2 is Limited Theatrical.
    const theatricalRelease = countryReleases.release_dates.find((release: any) => 
        release && (release.type === 3 || release.type === 2)
    );
    
    if (theatricalRelease && theatricalRelease.release_date) {
        try {
            const releaseDate = new Date(theatricalRelease.release_date);
            // Check if the date is valid
            if (isNaN(releaseDate.getTime())) {
                console.warn("Invalid theatrical release date found:", theatricalRelease.release_date);
                return false;
            }
            // Movie is considered "in theaters" if it was released in the last 3 months up to today.
            return releaseDate >= threeMonthsAgo && releaseDate <= today;
        } catch (e) {
            console.error("Error parsing theatrical release date:", theatricalRelease.release_date, e);
            return false;
        }
    }

    return false;
};
  
export const fetchDetailsForModal = async (id: number, type: 'movie' | 'tv', countryCode: string): Promise<Partial<MediaDetails>> => {
      try {
          const appendToResponse = 'videos,credits,recommendations,images,watch/providers,external_ids' + (type === 'movie' ? ',release_dates' : ',content_ratings');
          const endpoint = `/${type}/${id}?append_to_response=${appendToResponse}&include_image_language=en,null`;
          const details = await fetchApi<any>(endpoint);
          
          const baseDetails = formatMediaDetailsFromApiResponse(details, type);
          const textlessBackdrop = findBestTextlessBackdrop(details.images);

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
              const usRelease = details.release_dates?.results?.find((r: any) => r && r.iso_3166_1 === 'US');
              if (usRelease && Array.isArray(usRelease.release_dates) && usRelease.release_dates[0]?.certification) {
                  const certification = usRelease.release_dates[0].certification;
                  if (certification) {
                      additionalDetails.rated = certification;
                  }
              }
          } else { // type === 'tv'
              additionalDetails.numberOfSeasons = details.number_of_seasons;
              additionalDetails.lastAirDate = details.last_air_date;
              additionalDetails.status = details.status;
              const usRating = details.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US');
              if (usRating?.rating) {
                  additionalDetails.rated = usRating.rating;
              }
              additionalDetails.seasons = details.seasons;
          }
  
          const finalDetails = {
              ...baseDetails,
              textlessBackdropUrl: textlessBackdrop,
              cast: formatCast(details.credits),
              crew: formatCrew(details.credits.crew),
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
              trailerUrl: null, cast: [], crew: [], related: [], watchProviders: null, isInTheaters: false, imdbId: null,
          };
      }
};

const formatEpisode = (episode: any): Episode => {
    return {
        id: episode.id,
        title: episode.name || `Episode ${episode.episode_number}`,
        overview: episode.overview,
        stillUrl: episode.still_path ? `https://image.tmdb.org/t/p/w300${episode.still_path}` : 'https://i.postimg.cc/9F0b7f6f/placeholder-still.png',
        airDate: episode.air_date,
        episodeNumber: episode.episode_number,
        seasonNumber: episode.season_number,
    };
};

export const fetchSeasonDetails = async (tvId: number, seasonNumber: number): Promise<SeasonDetails> => {
    try {
        const endpoint = `/tv/${tvId}/season/${seasonNumber}`;
        const details = await fetchApi<any>(endpoint);

        return {
            id: details.id,
            seasonNumber: details.season_number,
            name: details.name,
            overview: details.overview,
            posterUrl: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : 'https://picsum.photos/500/750?grayscale',
            episodes: details.episodes.map(formatEpisode),
        };
    } catch (error) {
        console.error(`Failed to fetch season details for TV ID ${tvId}, season ${seasonNumber}:`, error);
        throw error;
    }
};

export const getTrending = (): Promise<MediaDetails[]> => fetchList('/trending/all/week');
export const getPopularMovies = (): Promise<MediaDetails[]> => fetchList('/movie/popular', 'movie');
export const getPopularTv = (): Promise<MediaDetails[]> => fetchList('/tv/popular', 'tv');
export const getNowPlayingMovies = (): Promise<MediaDetails[]> => fetchList('/movie/now_playing', 'movie');
export const getTopRatedMovies = (): Promise<MediaDetails[]> => fetchList('/movie/top_rated', 'movie');
export const getTopRatedTv = (): Promise<MediaDetails[]> => fetchList('/tv/top_rated', 'tv');

export const getComingSoonMedia = async (): Promise<MediaDetails[]> => {
    const upcomingMovies = await fetchList('/movie/upcoming', 'movie');
    const onTheAirTv = await fetchList('/tv/on_the_air', 'tv');

    // Combine and sort by release date, soonest first
    const combined = [...upcomingMovies, ...onTheAirTv];
    combined.sort((a, b) => {
        const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
        const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
        return dateA - dateB;
    });

    return combined.slice(0, 20);
};

export const searchMedia = (query: string): Promise<MediaDetails[]> => {
    return fetchList(`/search/multi?query=${encodeURIComponent(query)}`);
};

export const fetchCollectionDetails = async (collectionId: number): Promise<CollectionDetails> => {
    const details = await fetchApi<any>(`/collection/${collectionId}`);
    return {
        id: details.id,
        name: details.name,
        overview: details.overview,
        posterUrl: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : 'https://picsum.photos/500/750',
        backdropUrl: details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : 'https://picsum.photos/1280/720',
        parts: details.parts
            .map((item: any) => formatMediaListItem(item, 'movie'))
            .filter((item): item is MediaDetails => item !== null)
    };
};

export const fetchMediaByIds = async (ids: { id: number; type: 'movie' | 'tv' }[]): Promise<MediaDetails[]> => {
    const promises = ids.map(item =>
        fetchApi<any>(`/${item.type}/${item.id}`).then(details =>
            formatMediaListItem(details, item.type)
        )
    );
    const results = await Promise.all(promises);
    return results.filter((item): item is MediaDetails => item !== null);
};

export const fetchMediaByCollectionIds = async (collectionIds: number[]): Promise<MediaDetails[]> => {
    const allMedia: MediaDetails[] = [];
    const seenIds = new Set<number>();

    for (const id of collectionIds) {
        try {
            const collection = await fetchCollectionDetails(id);
            if (collection.parts) {
                collection.parts.forEach(part => {
                    if (!seenIds.has(part.id)) {
                        allMedia.push(part);
                        seenIds.add(part.id);
                    }
                });
            }
        } catch (error) {
            console.error(`Failed to fetch collection ID ${id}:`, error);
        }
    }

    return allMedia;
};

export const getMediaByStudio = async (companyIds: number[]): Promise<MediaDetails[]> => {
    const endpoint = `/discover/movie?with_companies=${companyIds.join('|')}&sort_by=popularity.desc`;
    return fetchList(endpoint, 'movie');
};

export const getMediaByNetwork = async (networkId: number): Promise<MediaDetails[]> => {
    const endpoint = `/discover/tv?with_networks=${networkId}&sort_by=popularity.desc`;
    return fetchList(endpoint, 'tv');
};

export const getMediaByStreamingProvider = async (providerKey: StreamingProviderInfo['key'], countryCode: string): Promise<MediaDetails[]> => {
    const provider = supportedProviders.find(p => p.key === providerKey);
    if (!provider) return [];
    
    const movieEndpoint = `/discover/movie?with_watch_providers=${provider.id}&watch_region=${countryCode}&sort_by=popularity.desc`;
    const tvEndpoint = `/discover/tv?with_watch_providers=${provider.id}&watch_region=${countryCode}&sort_by=popularity.desc`;

    const [movies, tvShows] = await Promise.all([
        fetchList(movieEndpoint, 'movie'),
        fetchList(tvEndpoint, 'tv')
    ]);

    // Interleave movies and TV shows for variety
    const results: MediaDetails[] = [];
    const maxLength = Math.max(movies.length, tvShows.length);
    for (let i = 0; i < maxLength; i++) {
        if (movies[i]) results.push(movies[i]);
        if (tvShows[i]) results.push(tvShows[i]);
    }
    return results;
};

export const fetchWatchProviders = async (id: number, type: 'movie' | 'tv', countryCode: string): Promise<WatchProviders | null> => {
    try {
        const endpoint = `/${type}/${id}/watch/providers`;
        const data = await fetchApi<{ results: any }>(endpoint);
        const providersData = data.results?.[countryCode.toUpperCase()];
        if (providersData) {
            return {
                link: providersData.link,
                flatrate: providersData.flatrate,
                rent: providersData.rent,
                buy: providersData.buy,
            };
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch providers for ${type} ${id} in ${countryCode}:`, error);
        return null;
    }
};


export const getMediaByPerson = async (personId: number, role: 'actor' | 'director'): Promise<MediaDetails[]> => {
    let endpoint: string;
    if (role === 'actor') {
        endpoint = `/person/${personId}/movie_credits`;
    } else { // director
        endpoint = `/person/${personId}/movie_credits`;
    }
    
    const response = await fetchApi<{ cast: any[], crew: any[] }>(endpoint);
    let mediaList: any[];

    if (role === 'actor') {
        mediaList = response.cast;
    } else {
        mediaList = response.crew.filter(c => c.job === 'Director');
    }
    
    // Sort by popularity and take the top 20
    mediaList.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    return mediaList.slice(0, 20)
        .map(item => formatMediaListItem(item, 'movie'))
        .filter((item): item is MediaDetails => item !== null);
};

// FIX: Implement fetchActorDetails to return a complete ActorDetails object.
export const fetchActorDetails = async (actorId: number): Promise<ActorDetails> => {
    const appendToResponse = 'movie_credits';
    const endpoint = `/person/${actorId}?append_to_response=${appendToResponse}`;
    const details = await fetchApi<any>(endpoint);
    
    const filmography = details.movie_credits.cast
        .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 10)
        .map((item: any) => formatMediaListItem(item, 'movie'))
        .filter((item): item is MediaDetails => item !== null);

    return {
        id: details.id,
        name: details.name,
        biography: details.biography,
        profilePath: details.profile_path ? `https://image.tmdb.org/t/p/h632${details.profile_path}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(details.name)}&background=374151&color=fff&size=632`,
        birthday: details.birthday,
        placeOfBirth: details.place_of_birth,
        filmography: filmography,
    };
};

// FIX: Implement functions for the Higher/Lower game.
const getEntityId = async (query: string, type: 'person' | 'company'): Promise<number | null> => {
    const cacheKey = `${type}-${query.toLowerCase()}`;
    if (entityCache.has(cacheKey)) {
        return entityCache.get(cacheKey)!;
    }
    try {
        const data = await fetchApi<{ results: { id: number }[] }>(`/search/${type}?query=${encodeURIComponent(query)}`);
        if (data.results.length > 0) {
            const id = data.results[0].id;
            entityCache.set(cacheKey, id);
            return id;
        }
        return null;
    } catch (error) {
        console.error(`Failed to get ID for ${type} "${query}":`, error);
        return null;
    }
};

export const discoverMediaFromAi = async (params: AiSearchParams): Promise<MediaDetails[]> => {
    const mediaType = params.media_type === 'tv' ? 'tv' : 'movie';
    let endpoint = `/discover/${mediaType}?`;
    
    const queryParts: string[] = [];

    if (params.sort_by) {
        queryParts.push(`sort_by=${params.sort_by}`);
    } else {
        queryParts.push('sort_by=popularity.desc');
    }

    if (params.genres && params.genres.length > 0) {
        const genreIds = params.genres.map(g => genreMap[g.toLowerCase()]).filter(id => id);
        if (genreIds.length > 0) {
            queryParts.push(`with_genres=${genreIds.join(',')}`);
        }
    }

    if (params.keywords && params.keywords.length > 0) {
        queryParts.push(`with_keywords=${encodeURIComponent(params.keywords.join(','))}`);
    }

    if (params.year_from) {
        queryParts.push(`${mediaType === 'tv' ? 'first_air_date' : 'primary_release_date'}.gte=${params.year_from}-01-01`);
    }
    if (params.year_to) {
        queryParts.push(`${mediaType === 'tv' ? 'first_air_date' : 'primary_release_date'}.lte=${params.year_to}-12-31`);
    }

    // Handle people (actors/directors) and companies
    if (params.actors && params.actors.length > 0) {
        const actorIds = (await Promise.all(params.actors.map(name => getEntityId(name, 'person')))).filter(id => id);
        if (actorIds.length > 0) {
            queryParts.push(`with_cast=${actorIds.join(',')}`);
        }
    }
    
    if (params.directors && params.directors.length > 0) {
        const directorIds = (await Promise.all(params.directors.map(name => getEntityId(name, 'person')))).filter(id => id);
        if (directorIds.length > 0) {
            const crewQuery = directorIds.map(id => `${id}`).join(',');
            queryParts.push(`with_crew=${crewQuery}`);
        }
    }
    
    if (params.companies && params.companies.length > 0) {
        const normalizedCompanies = params.companies.map(c => companyAliasMap[c.toLowerCase()] || c);
        const companyIds = (await Promise.all(normalizedCompanies.map(name => getEntityId(name, 'company')))).filter(id => id);
        if (companyIds.length > 0) {
            queryParts.push(`with_companies=${companyIds.join('|')}`);
        }
    }
    
    endpoint += queryParts.join('&');
    
    return fetchList(endpoint, mediaType);
};

export const fetchMoviesForGame = async (page: number = 1): Promise<GameMovie[]> => {
    const data = await fetchApi<{ results: any[] }>(`/discover/movie?sort_by=revenue.desc&page=${page}&vote_count.gte=500&with_runtime.gte=60`);
    
    const moviesWithImdbId = await Promise.all(
        data.results.slice(0, 10).map(async (movie) => {
            try {
                const details = await fetchApi<{ imdb_id: string }>(`/movie/${movie.id}/external_ids`);
                return { ...movie, imdb_id: details.imdb_id };
            } catch {
                return null;
            }
        })
    );

    const validMovies = moviesWithImdbId.filter(m => m && m.imdb_id);

    const moviesWithBoxOffice = await Promise.all(
        validMovies.map(async (movie) => {
            if (movie) {
                const boxOffice = await fetchBoxOffice(movie.imdb_id);
                if (boxOffice && boxOffice > 1000000) {
                    return {
                        id: movie.id,
                        imdbId: movie.imdb_id,
                        title: movie.title,
                        posterUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                        releaseYear: (movie.release_date || '').substring(0, 4),
                        boxOffice: boxOffice,
                        popularity: movie.popularity,
                    };
                }
            }
            return null;
        })
    );

    return moviesWithBoxOffice.filter((m): m is GameMovie => m !== null);
};

export const fetchMediaForPopularityGame = async (page: number = 1): Promise<GameMedia[]> => {
    const data = await fetchApi<{ results: any[] }>(`/discover/movie?sort_by=popularity.desc&page=${page}&vote_count.gte=500`);
    return data.results
        .filter(item => item.poster_path)
        .map(item => ({
            id: item.id,
            title: item.title,
            posterUrl: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
            releaseYear: (item.release_date || '').substring(0, 4),
            type: 'movie',
            popularity: item.popularity,
        }));
};

export const fetchActorsForAgeGame = async (page: number = 1): Promise<GameActor[]> => {
    const data = await fetchApi<{ results: any[] }>(`/person/popular?page=${page}`);
    const actorsWithDetails = await Promise.all(
        data.results.map(async (person) => {
            try {
                const details = await fetchApi<{ birthday: string }>(`/person/${person.id}`);
                if (details.birthday) {
                    return {
                        id: person.id,
                        name: person.name,
                        profileUrl: `https://image.tmdb.org/t/p/w500${person.profile_path}`,
                        birthday: details.birthday,
                    };
                }
                return null;
            } catch {
                return null;
            }
        })
    );
    return actorsWithDetails.filter((a): a is GameActor => a !== null);
};