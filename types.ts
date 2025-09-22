import { GoogleGenAI } from '@google/genai';

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

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  profileUrl: string;
}

export interface SeasonSummary {
    air_date: string | null;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
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
  textlessBackdropUrl?: string | null;
  type: 'movie' | 'tv';
  popularity?: number;
  releaseDate?: string; // e.g. "2023-10-26"
  mediaSubType?: 'short';
  imdbId?: string | null;
  // Optional detailed properties fetched on demand
  cast?: CastMember[];
  crew?: CrewMember[];
  related?: MediaDetails[];
  watchProviders?: WatchProviders | null;
  isInTheaters?: boolean;
  runtime?: number; // In minutes, for movies
  numberOfSeasons?: number; // For TV shows
  lastAirDate?: string; // For TV shows
  status?: string; // For TV shows, e.g. "Ended", "Returning Series"
  rated?: string; // MPAA rating from TMDb
  seasons?: SeasonSummary[];
}

export interface Collection {
  id: number;
  name: string;
  posterUrl: string;
  backdropUrl: string;
}

export interface CollectionDetails extends Collection {
    overview?: string;
    parts?: MediaDetails[];
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
  companyIds?: number[];
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

export interface ExternalRatings {
  rottenTomatoes?: string;
  metacritic?: string;
}

export interface Episode {
  id: number;
  title: string;
  overview: string;
  stillUrl: string;
  airDate: string | null;
  episodeNumber: number;
  seasonNumber: number;
}

export interface SeasonDetails {
  id: number;
  seasonNumber: number;
  name: string;
  overview: string;
  posterUrl: string;
  episodes: Episode[];
}

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
  backgroundUrl?: string;
  bgColor?: string;
  hoverGifUrl?: string;
  borderColor?: string;
  edgeToEdge?: boolean;
  hubBgColor?: string;
  hubLogoUrl?: string;
  hubLogoHeight?: string;
  hubLogoInvert?: boolean;
  forceWhiteLogo?: boolean;
}

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

export interface AiSearchParams {
  keywords?: string[];
  genres?: string[];
  actors?: string[];
  directors?: string[];
  companies?: string[];
  characters?: string[];
  year_from?: number;
  year_to?: number;
  sort_by?: 'popularity.desc' | 'release_date.desc' | 'vote_average.desc';
  original_query?: string;
  media_type?: 'movie' | 'tv' | 'all';
}

export interface ViewingGuideStep {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  reasoning: string;
}

export interface ViewingGuide {
  title: string;
  description: string;
  steps: ViewingGuideStep[];
}

export interface OmdbDetails {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: { Source: string; Value: string; }[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD?: string;
  BoxOffice?: string;
  Production?: string;
  Website?: string;
  Response: string;
}

export interface FunFact {
  category: string; // e.g., 'Casting', 'Production', 'Trivia'
  fact: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface RateLimitState {
  count: number;
  resetTime: number; // Timestamp
}

export interface TmdbAccountDetails {
    id: number;
    username: string;
    name: string;
    avatar: {
        tmdb: {
            avatar_path: string | null;
        }
    }
}

export interface TmdbAuth {
  sessionId: string | null;
  accountDetails: TmdbAccountDetails | null;
  state: 'idle' | 'loading' | 'authenticated' | 'error';
}

export interface SettingsContextType {
  geminiApiKey: string | null;
  aiClient: GoogleGenAI | null;
  rateLimit: RateLimitState;
  isInitialized: boolean;
  isAllClearMode: boolean;
  tmdb: TmdbAuth;
  loginWithTmdb: () => void;
  logoutTmdb: () => void;
  handleTmdbCallback: (requestToken: string) => Promise<void>;
  toggleAllClearMode: () => void;
  canMakeRequest: () => { canRequest: boolean; resetTime: number | null };
  incrementRequestCount: () => void;
  saveGeminiKey: (key: string) => void;
  clearAllSettings: () => void;
}

export interface AiCuratedCarousel {
  title: string;
  items: MediaDetails[];
}
