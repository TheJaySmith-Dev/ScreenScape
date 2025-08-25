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
  logoUrl?: string | null;
  type: 'movie' | 'tv';
  popularity?: number;
  releaseDate?: string; // e.g. "2023-10-26"
  mediaSubType?: 'short';
  // Optional detailed properties fetched on demand
  cast?: CastMember[];
  watchProviders?: WatchProviders;
  related?: MediaDetails[];
}

export interface Collection {
  id: number;
  name: string;
  posterUrl: string;
  backdropUrl: string;
}

export interface CollectionDetails extends Collection {
    overview: string;
    parts: MediaDetails[];
}

export interface UserLocation {
  name: string;
  code: string;
}

export interface CinemaChain {
  name: string;
  domain: string;
}

export interface VisionMessage {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  recommendations?: MediaDetails[];
  isLoading?: boolean;
}

export interface VisionResponse {
  responseText: string;
  recommendations?: GeminiRecommendation[];
}

export interface Studio {
  id: number;
  name: string;
  logoUrl: string;
  bgColor?: string;
  hoverGifUrl?: string;
  forceWhiteLogo?: boolean;
  sizeClass?: string;
}

export interface CharacterCollection extends Collection {}

export interface Brand {
  id: string;
  name: string;
  posterUrl: string;
  companyId: number;
  characterCollections: CharacterCollection[];
}

// New/Modified types for local auth
export interface User {
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
}

// User preferences
export interface LikedItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
}

export interface DislikedItem {
  id: number;
  type: 'movie' | 'tv';
}
