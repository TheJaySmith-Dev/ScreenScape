import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { GoogleGenAI } from '@google/genai';
import * as api from '../services/apiService.ts';
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

    const syncWithPreferences = useCallback(async (uid: string) => {
        const prefs = await api.getPreferences(uid);
        setTmdbApiKey(prefs.tmdbApiKey || null);
        setGeminiApiKey(prefs.geminiApiKey || null);
        if (prefs.rateLimitState) {
            if (new Date().getTime() > prefs.rateLimitState.resetTime) {
                setRateLimit({ count: 0, resetTime: new Date().getTime() + 24 * 60 * 60 * 1000 });
            } else {
                setRateLimit(prefs.rateLimitState);
            }
        } else {
            setRateLimit({ count: 0, resetTime: new Date().getTime() + 24 * 60 * 60 * 1000 });
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
        if (!currentUser) {
            localStorage.removeItem(LOCAL_STORAGE_KEY_TMDB);
            localStorage.removeItem(LOCAL_STORAGE_KEY_GEMINI);
            localStorage.removeItem(LOCAL_STORAGE_KEY_RATE_LIMIT);
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