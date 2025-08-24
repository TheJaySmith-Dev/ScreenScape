export interface GeminiRecommendation {
  title: string;
  year: number;
  type: 'movie' | 'tv';
}

export interface TmdbSearchResult {
  id: number;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
}

export interface TmdbVideo {
  key: string;
  site: string;
  type: string;
}

export interface CastMember {
  name: string;
  character: string;
  profileUrl: string;
}

export interface WatchProvider {
  provider_name: string;
  logo_path: string;
}

export interface WatchProviders {
  flatrate?: WatchProvider[]; // For streaming services
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}


export interface MediaDetails {
  id: number;
  title: string;
  overview: string;
  posterUrl: string;
  backdropUrl:string;
  releaseYear: string;
  rating: number;
  trailerUrl: string | null;
  type: 'movie' | 'tv';
  // Optional detailed properties fetched on demand
  cast?: CastMember[];
  watchProviders?: WatchProviders;
  related?: MediaDetails[];
}