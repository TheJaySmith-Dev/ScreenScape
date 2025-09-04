
export type MediaTypeFilter = 'all' | 'movie' | 'show' | 'short';
export type SortBy = 'trending' | 'newest' | 'timeline';

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
  id: number;
  name: string;
  character: string;
  profileUrl: string;
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
  textlessPosterUrl?: string | null;
  type: 'movie' | 'tv';
  popularity?: number;
  releaseDate?: string; // e.g. "2023-10-26"
  mediaSubType?: 'short';
  imdbId?: string | null;
  // Optional detailed properties fetched on demand
  cast?: CastMember[];
  related?: MediaDetails[];
  watchProviders?: WatchProviders | null;
  isInTheaters?: boolean;
  runtime?: number; // In minutes, for movies
  numberOfSeasons?: number; // For TV shows
  lastAirDate?: string; // For TV shows
  status?: string; // For TV shows, e.g. "Ended", "Returning Series"
  rated?: string; // MPAA rating from TMDb
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

export interface Studio {
  id: number;
  name: string;
  logoUrl: string;
  bgColor?: string;
  hoverGifUrl?: string;
  forceWhiteLogo?: boolean;
  sizeClass?: string;
}

export interface Network {
  id: number;
  name: string;
  logoUrl: string;
  bgColor?: string;
  hoverGifUrl?: string;
  forceWhiteLogo?: boolean;
  sizeClass?: string;
}

export interface CharacterCollection extends Collection {
  mediaIds?: { id: number; type: 'movie' | 'tv' }[];
}

export interface Brand {
  id: string;
  name: string;
  posterUrl: string;
  backdropUrl?: string;
  companyId?: number;
  characterCollections: CharacterCollection[];
  mediaIds?: { id: number; type: 'movie' | 'tv' }[];
  collectionIds?: number[];
  defaultSort?: SortBy;
  // New properties for richer brand cards
  logoUrl?: string;
  bgColor?: string;
  hoverGifUrl?: string;
  borderColor?: string;
}

export interface Person {
  id: string;
  name: string;
  posterUrl: string;
  tmdbId: number;
  role: 'actor' | 'director';
}

export interface Actor {
  id: number;
  name: string;
  biography: string;
  profilePath: string;
  birthday: string | null;
  placeOfBirth: string | null;
}

export interface ActorDetails extends Actor {
  filmography: MediaDetails[];
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
  posterUrl: string;
  releaseYear: string;
}

export interface DislikedItem {
  id: number;
  type: 'movie' | 'tv';
}

// FIX: Add missing ExternalRatings type definition to fix import error in ExternalRatings.tsx.
export interface ExternalRatings {
  rottenTomatoes?: string;
  metacritic?: string;
}

// TMDB Watch Provider Types
export interface WatchProvider {
    provider_id: number;
    provider_name: string;
    logo_path: string;
    display_priority: number;
}

export interface WatchProviders {
    link?: string;
    flatrate?: WatchProvider[];
    rent?: WatchProvider[];
    buy?: WatchProvider[];
}

export interface StreamingProviderInfo {
  id: number;
  key: 'disney' | 'netflix' | 'prime' | 'max' | 'paramount';
  name: string;
  logoUrl: string;
  bgColor?: string;
  hoverGifUrl?: string;
  borderColor?: string;
  edgeToEdge?: boolean;
  // New properties for hub pages
  hubBgColor?: string;
  hubLogoUrl?: string;
  hubLogoHeight?: string;
  hubLogoInvert?: boolean;
}

// Types for the Higher or Lower game
export interface GameMovie {
  id: number;
  imdbId: string;
  title: string;
  posterUrl: string;
  releaseYear: string;
  boxOffice: number;
  popularity: number;
}

export interface GameMedia {
  id: number;
  title: string;
  posterUrl: string;
  releaseYear: string;
  type: 'movie' | 'tv';
  popularity: number;
}

export interface GameActor {
  id: number;
  name: string;
  profileUrl: string;
  birthday: string; // 'YYYY-MM-DD'
}