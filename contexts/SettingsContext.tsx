import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { GoogleGenAI } from '@google/genai';
import * as api from '../services/apiService.ts';
import { setLocalTmdbApiKey } from '../services/apiService.ts';
import { useAuth } from '../hooks/useAuth.ts';
import type { SettingsContextType, RateLimitState } from '../types.ts';

const LOCAL_STORAGE_KEY_TMDB = 'screenscape_tmdb_api_key';
const LOCAL_STORAGE_KEY_GEMINI = 'screenscape_gemini_api_key';
const LOCAL_STORAGE_KEY_RATE_LIMIT = 'screenscape_rate_limit';

const getInitialRateLimit = (): RateLimitState => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY_RATE_LIMIT);
        if (stored) {
            const state: RateLimitState = JSON.parse(stored);
            if (new Date().getTime() > state.resetTime) {
                // If the stored reset time is in the past, reset the counter.
                return { count: 0, resetTime: new Date().getTime() + 24 * 60 * 60 * 1000 };
            }
            return state;
        }
    } catch (e) {
        console.error("Failed to parse rate limit state from local storage", e);
    }
    // Default state if nothing is stored or parsing fails.
    return { count: 0, resetTime: new Date().getTime() + 24 * 60 * 60 * 1000 };
};

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [tmdbApiKey, setTmdbApiKey] = useState<string | null>(null);
    const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
    const [aiClient, setAiClient] = useState<GoogleGenAI | null>(null);
    const [rateLimit, setRateLimit] = useState<RateLimitState>(getInitialRateLimit());
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // This effect ensures that any service outside of React that needs the
        // TMDb API key has access to the most current one.
        setLocalTmdbApiKey(tmdbApiKey);
    }, [tmdbApiKey]);

    useEffect(() => {
        // This is the main synchronization logic. It waits until Firebase has confirmed
        // the user's authentication status (`authLoading` is false) before running.
        if (authLoading) {
            return;
        }

        const syncSettings = async () => {
            setIsInitialized(false); // Mark as not ready while we sync

            // Get local state first, as it's always available synchronously.
            const localTmdbKey = localStorage.getItem(LOCAL_STORAGE_KEY_TMDB);
            const localGeminiKey = localStorage.getItem(LOCAL_STORAGE_KEY_GEMINI);
            const localRateLimit = getInitialRateLimit(); // This function already handles expiry.

            if (currentUser) {
                // --- USER IS LOGGED IN ---
                const remotePrefs = await api.getPreferences(currentUser.uid);
                const prefsToSave: Partial<api.Preferences> = {};
                let needsSave = false;

                // 1. Sync API Keys (MIGRATE-UP strategy)
                // If remote key is empty/null but a local key exists, use the local one and mark for saving.
                const remoteTmdbKey = remotePrefs.tmdbApiKey;
                const finalTmdbKey = (remoteTmdbKey && remoteTmdbKey.trim() !== '') ? remoteTmdbKey : localTmdbKey;
                if (finalTmdbKey && finalTmdbKey !== remoteTmdbKey) {
                    prefsToSave.tmdbApiKey = finalTmdbKey;
                    needsSave = true;
                }

                const remoteGeminiKey = remotePrefs.geminiApiKey;
                const finalGeminiKey = (remoteGeminiKey && remoteGeminiKey.trim() !== '') ? remoteGeminiKey : localGeminiKey;
                if (finalGeminiKey && finalGeminiKey !== remoteGeminiKey) {
                    prefsToSave.geminiApiKey = finalGeminiKey;
                    needsSave = true;
                }
                
                setTmdbApiKey(finalTmdbKey || null);
                setGeminiApiKey(finalGeminiKey || null);

                // 2. Sync Rate Limit (CLOUD-FIRST strategy)
                let finalRateLimit = remotePrefs.rateLimitState;
                const now = Date.now();

                // If no remote state exists, or the remote state is expired, create a fresh one.
                if (!finalRateLimit || now > finalRateLimit.resetTime) {
                    finalRateLimit = { count: 0, resetTime: now + 24 * 60 * 60 * 1000 };
                    prefsToSave.rateLimitState = finalRateLimit;
                    needsSave = true;
                }
                setRateLimit(finalRateLimit);

                // 3. Perform the save operation if anything needs to be updated in the cloud.
                if (needsSave) {
                    await api.savePreferences(currentUser.uid, prefsToSave);
                }
                
                // 4. Clean up local storage after successful sync to prevent future conflicts.
                // This is a crucial step.
                localStorage.removeItem(LOCAL_STORAGE_KEY_TMDB);
                localStorage.removeItem(LOCAL_STORAGE_KEY_GEMINI);
                localStorage.removeItem(LOCAL_STORAGE_KEY_RATE_LIMIT);

            } else {
                // --- USER IS LOGGED OUT ---
                // State is determined purely by what's in the browser's local storage.
                setTmdbApiKey(localTmdbKey);
                setGeminiApiKey(localGeminiKey);
                setRateLimit(localRateLimit);
            }

            setIsInitialized(true); // Signal that settings are loaded and app can render.
        };

        syncSettings();
    }, [currentUser, authLoading]);

    useEffect(() => {
        // Initialize the Gemini AI client whenever the API key changes.
        if (geminiApiKey) {
            try {
                const client = new GoogleGenAI({ apiKey: geminiApiKey });
                setAiClient(client);
            } catch (error) {
                console.error("Failed to initialize Gemini AI Client:", error);
                setAiClient(null);
            }
        } else {
            setAiClient(null);
        }
    }, [geminiApiKey]);

    const saveApiKeys = useCallback(async (keys: { tmdbKey: string; geminiKey: string }) => {
        setTmdbApiKey(keys.tmdbKey);
        setGeminiApiKey(keys.geminiKey);
        if (currentUser) {
            await api.savePreferences(currentUser.uid, { tmdbApiKey: keys.tmdbKey, geminiApiKey: keys.geminiKey });
        } else {
            localStorage.setItem(LOCAL_STORAGE_KEY_TMDB, keys.tmdbKey);
            localStorage.setItem(LOCAL_STORAGE_KEY_GEMINI, keys.geminiKey);
        }
    }, [currentUser]);

    const incrementRequestCount = useCallback(() => {
        setRateLimit(currentRateLimit => {
            const now = new Date().getTime();
            let newRateLimit: RateLimitState;
            if (now > currentRateLimit.resetTime) {
                newRateLimit = { count: 1, resetTime: now + 24 * 60 * 60 * 1000 };
            } else {
                newRateLimit = { ...currentRateLimit, count: currentRateLimit.count + 1 };
            }
            
            // Persist the new rate limit state.
            if (currentUser) {
                api.savePreferences(currentUser.uid, { rateLimitState: newRateLimit });
            } else {
                localStorage.setItem(LOCAL_STORAGE_KEY_RATE_LIMIT, JSON.stringify(newRateLimit));
            }
            return newRateLimit;
        });
    }, [currentUser]);

    const canMakeRequest = useCallback(() => {
        const now = new Date().getTime();
        // Check for stale rate limit state and allow request if it should have been reset.
        if (now > rateLimit.resetTime) {
            return { canRequest: true, resetTime: null };
        }
        if (rateLimit.count < 500) {
            return { canRequest: true, resetTime: null };
        }
        return { canRequest: false, resetTime: rateLimit.resetTime };
    }, [rateLimit]);

    const clearAllSettings = useCallback(() => {
        const newRateLimit = { count: 0, resetTime: new Date().getTime() + 24 * 60 * 60 * 1000 };
        setTmdbApiKey(null);
        setGeminiApiKey(null);
        setAiClient(null);
        setRateLimit(newRateLimit);
        
        localStorage.removeItem(LOCAL_STORAGE_KEY_TMDB);
        localStorage.removeItem(LOCAL_STORAGE_KEY_GEMINI);
        localStorage.removeItem(LOCAL_STORAGE_KEY_RATE_LIMIT);
        
        if (currentUser) {
             api.savePreferences(currentUser.uid, { tmdbApiKey: '', geminiApiKey: '', rateLimitState: newRateLimit });
        }
    }, [currentUser]);

    const value = {
        tmdbApiKey,
        geminiApiKey,
        aiClient,
        rateLimit,
        isInitialized,
        canMakeRequest,
        incrementRequestCount,
        saveApiKeys,
        clearAllSettings,
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
