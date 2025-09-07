// Preferences are now handled by local storage. This service is only for providing
// the TMDb API key to other services outside the React tree.

// This module-level variable holds the current TMDb API key for services
// that are outside the React component tree (e.g., mediaService).
// It is managed by the SettingsContext to ensure it's always in sync.
let localTmdbApiKey: string | null = null;

export const getTmdbApiKey = (): string | null => {
    return localTmdbApiKey;
};

export const setLocalTmdbApiKey = (key: string | null): void => {
    localTmdbApiKey = key;
};
