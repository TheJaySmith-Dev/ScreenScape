
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

export interface ExternalRatings {
  imdb?: string;
  rottenTomatoes?: string;
  metacritic?: string;
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
  otherRatings?: ExternalRatings;
  rated?: string; // MPAA rating
  awards?: string;
  runtime?: number; // In minutes, for movies
  numberOfSeasons?: number; // For TV shows
  lastAirDate?: string; // For TV shows
  status?: string; // For TV shows, e.g. "Ended", "Returning Series"
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

export interface CharacterCollection extends Collection {}

export interface Brand {
  id: string;
  name: string;
  posterUrl: string;
  companyId: number;
  characterCollections: CharacterCollection[];
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
  key: 'disney' | 'netflix' | 'prime' | 'max';
  name: string;
  logoUrl: string;
  bgColor?: string;
  hoverGifUrl?: string;
}