// Shared types for Netlify functions to ensure consistency.

export interface User {
  id: number;
  email: string;
  displayName: string;
  photoURL?: string | null;
}

// Corresponds to the frontend LikedItem type
export interface LikedItem {
  id: number; // This is the mediaId from TMDB
  type: 'movie' | 'tv';
  title: string;
  posterUrl: string;
  releaseYear: string;
}

// Corresponds to the frontend DislikedItem type
export interface DislikedItem {
  id: number; // This is the mediaId from TMDB
  type: 'movie' | 'tv';
}
