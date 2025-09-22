// This module acts as a simple in-memory store for the user-provided TMDb API key.
// It allows services to access the key without needing to be passed it from the UI layer.

let tmdbApiKey: string | null = null;

export const setTmdbApiKey = (key: string | null): void => {
  tmdbApiKey = key;
};

export const getTmdbApiKey = (): string | null => {
  return tmdbApiKey;
};
