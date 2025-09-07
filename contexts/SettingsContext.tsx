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
                return { count: 0, resetTime: new Date().getTime() + 24 * 60 * 60 * 1000 };
            }
            return state;
        }
    } catch (e) {
        console.error("Failed to parse rate limit state", e);
    }
    return { count: 0, resetTime: new Date().getTime() + 24 * 60 * 60 * 1000 };
};

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [tmdbApiKey, setTmdbApiKey] = useState<string | null>(null);
    const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
    const [aiClient, setAiClient] = useState<GoogleGenAI | null>(null);
    const [rateLimit, setRateLimit] = useState<RateLimitState>(getInitialRateLimit());
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        setLocalTmdbApiKey(tmdbApiKey);
    }, [tmdbApiKey]);

    const syncWithPreferences = useCallback(async (uid: string) => {
        const remotePrefs = await api.getPreferences(uid);
        const localTmdbKey = localStorage.getItem(LOCAL_STORAGE_KEY_TMDB);
        const localGeminiKey = localStorage.getItem(LOCAL_STORAGE_KEY_GEMINI);

        const finalTmdbKey = remotePrefs.tmdbApiKey || localTmdbKey || null;
        const finalGeminiKey = remotePrefs.geminiApiKey || localGeminiKey || null;
        
        const prefsToSave: Partial<api.Preferences> = {};
        let needsSave = false;

        // Migrate local keys to remote if remote is empty
        if (localTmdbKey && !remotePrefs.tmdbApiKey) {
            prefsToSave.tmdbApiKey = localTmdbKey;
            needsSave = true;
        }
        if (localGeminiKey && !remotePrefs.geminiApiKey) {
            prefsToSave.geminiApiKey = localGeminiKey;
            needsSave = true;
        }

        setTmdbApiKey(finalTmdbKey);
        setGeminiApiKey(finalGeminiKey);
        
        const now = new Date().getTime();
        let currentRateLimit = remotePrefs.rateLimitState!;

        if (now > currentRateLimit.resetTime) {
            currentRateLimit = { count: 0, resetTime: now + 24 * 60 * 60 * 1000 };
            prefsToSave.rateLimitState = currentRateLimit;
            needsSave = true;
        }
        setRateLimit(currentRateLimit);

        if (needsSave) {
            await api.savePreferences(uid, prefsToSave);
        }
        
        setIsInitialized(true);
    }, []);

    const syncWithLocalStorage = useCallback(() => {
        const tmdbKey = localStorage.getItem(LOCAL_STORAGE_KEY_TMDB);
        const geminiKey = localStorage.getItem(LOCAL_STORAGE_KEY_GEMINI);
        setTmdbApiKey(tmdbKey);
        setGeminiApiKey(geminiKey);
        setRateLimit(getInitialRateLimit());
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (currentUser) {
            syncWithPreferences(currentUser.uid);
        } else {
            // When user logs out, or for anonymous users.
            setIsInitialized(false); // Reset initialization state to force re-load
            syncWithLocalStorage();
        }
    }, [currentUser, syncWithPreferences, syncWithLocalStorage]);

    useEffect(() => {
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

    const updateRateLimit = useCallback((newRateLimit: RateLimitState) => {
        setRateLimit(newRateLimit);
        if (currentUser) {
            api.savePreferences(currentUser.uid, { rateLimitState: newRateLimit });
        } else {
            localStorage.setItem(LOCAL_STORAGE_KEY_RATE_LIMIT, JSON.stringify(newRateLimit));
        }
    }, [currentUser]);

    const canMakeRequest = useCallback(() => {
        const now = new Date().getTime();
        if (now > rateLimit.resetTime) {
            return { canRequest: true, resetTime: null };
        }
        if (rateLimit.count < 500) {
            return { canRequest: true, resetTime: null };
        }
        return { canRequest: false, resetTime: rateLimit.resetTime };
    }, [rateLimit]);

    const incrementRequestCount = useCallback(() => {
        const now = new Date().getTime();
        if (now > rateLimit.resetTime) {
            updateRateLimit({ count: 1, resetTime: now + 24 * 60 * 60 * 1000 });
        } else {
            updateRateLimit({ ...rateLimit, count: rateLimit.count + 1 });
        }
    }, [rateLimit, updateRateLimit]);

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
    
    const clearAllSettings = useCallback(() => {
        setTmdbApiKey(null);
        setGeminiApiKey(null);
        setAiClient(null);
        const newRateLimit = { count: 0, resetTime: new Date().getTime() + 24 * 60 * 60 * 1000 };
        setRateLimit(newRateLimit);
        // This function is for a manual "clear" action. The logout flow is handled by useEffect.
        // It should clear both local storage and remote if user is logged in.
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