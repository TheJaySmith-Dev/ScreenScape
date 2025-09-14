import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { GoogleGenAI } from '@google/genai';
import { setLocalTmdbApiKey } from '../services/apiService.ts';
import type { SettingsContextType, RateLimitState } from '../types.ts';

const LOCAL_STORAGE_KEY_TMDB = 'screenscape_tmdb_api_key';
const LOCAL_STORAGE_KEY_GEMINI = 'screenscape_gemini_api_key';
const LOCAL_STORAGE_KEY_KINOCHECK = 'screenscape_kinocheck_api_key';
const LOCAL_STORAGE_KEY_RATE_LIMIT = 'screenscape_rate_limit';
const LOCAL_STORAGE_KEY_ALL_CLEAR = 'screenscape_all_clear_mode';

const getInitialRateLimit = (): RateLimitState => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY_RATE_LIMIT);
        if (stored) {
            const state: RateLimitState = JSON.parse(stored);
            // Check if the current time is past the stored reset time.
            if (new Date().getTime() > state.resetTime) {
                // If it is, reset the counter for a new 24-hour window.
                const newResetTime = new Date().setHours(23, 59, 59, 999);
                return { count: 0, resetTime: newResetTime };
            }
            return state;
        }
    } catch (e) {
        console.error("Failed to parse rate limit state from local storage", e);
    }
    // Default state if nothing is stored or parsing fails.
    const newResetTime = new Date().setHours(23, 59, 59, 999);
    return { count: 0, resetTime: newResetTime };
};

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tmdbApiKey, setTmdbApiKey] = useState<string | null>(null);
    const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
    const [kinocheckApiKey, setKinocheckApiKey] = useState<string | null>(null);
    const [aiClient, setAiClient] = useState<GoogleGenAI | null>(null);
    const [rateLimit, setRateLimit] = useState<RateLimitState>(getInitialRateLimit());
    const [isInitialized, setIsInitialized] = useState(false);
    const [isAllClearMode, setIsAllClearMode] = useState<boolean>(false);

    // Initialize settings from local storage on component mount
    useEffect(() => {
        const localTmdbKey = localStorage.getItem(LOCAL_STORAGE_KEY_TMDB);
        const localGeminiKey = localStorage.getItem(LOCAL_STORAGE_KEY_GEMINI);
        const localKinocheckKey = localStorage.getItem(LOCAL_STORAGE_KEY_KINOCHECK);
        const localAllClear = localStorage.getItem(LOCAL_STORAGE_KEY_ALL_CLEAR);
        
        if (localTmdbKey) {
            setTmdbApiKey(localTmdbKey);
            // Immediately sync with the apiService to prevent race conditions
            setLocalTmdbApiKey(localTmdbKey);
        }
        if (localAllClear) {
            setIsAllClearMode(JSON.parse(localAllClear));
        }
        
        setGeminiApiKey(localGeminiKey);
        setKinocheckApiKey(localKinocheckKey);
        setRateLimit(getInitialRateLimit());
        
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (geminiApiKey) {
            try {
                // All AI calls use the efficient gemini-2.5-flash model
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

    const saveApiKeys = useCallback((keys: { tmdbKey: string; geminiKey: string; kinocheckKey: string }) => {
        setTmdbApiKey(keys.tmdbKey);
        setLocalTmdbApiKey(keys.tmdbKey); // Sync immediately
        setGeminiApiKey(keys.geminiKey);
        setKinocheckApiKey(keys.kinocheckKey);
        localStorage.setItem(LOCAL_STORAGE_KEY_TMDB, keys.tmdbKey);
        localStorage.setItem(LOCAL_STORAGE_KEY_GEMINI, keys.geminiKey);
        localStorage.setItem(LOCAL_STORAGE_KEY_KINOCHECK, keys.kinocheckKey);
    }, []);

    const toggleAllClearMode = useCallback(() => {
        setIsAllClearMode(prev => {
            const newState = !prev;
            localStorage.setItem(LOCAL_STORAGE_KEY_ALL_CLEAR, JSON.stringify(newState));
            return newState;
        });
    }, []);

    const incrementRequestCount = useCallback(() => {
        setRateLimit(currentRateLimit => {
            const now = new Date().getTime();
            let newRateLimit: RateLimitState;
            if (now > currentRateLimit.resetTime) {
                const newResetTime = new Date().setHours(23, 59, 59, 999);
                newRateLimit = { count: 1, resetTime: newResetTime };
            } else {
                newRateLimit = { ...currentRateLimit, count: currentRateLimit.count + 1 };
            }
            
            localStorage.setItem(LOCAL_STORAGE_KEY_RATE_LIMIT, JSON.stringify(newRateLimit));
            return newRateLimit;
        });
    }, []);

    const canMakeRequest = useCallback(() => {
        const now = new Date().getTime();
        if (now > rateLimit.resetTime) {
            return { canRequest: true, resetTime: null };
        }
        if (rateLimit.count < 500) { // Hardcoded limit
            return { canRequest: true, resetTime: null };
        }
        return { canRequest: false, resetTime: rateLimit.resetTime };
    }, [rateLimit]);

    const clearAllSettings = useCallback(() => {
        const newResetTime = new Date().setHours(23, 59, 59, 999);
        const newRateLimit = { count: 0, resetTime: newResetTime };

        setTmdbApiKey(null);
        setLocalTmdbApiKey(null); // Sync immediately
        setGeminiApiKey(null);
        setKinocheckApiKey(null);
        setAiClient(null);
        setRateLimit(newRateLimit);
        setIsAllClearMode(false);
        
        localStorage.removeItem(LOCAL_STORAGE_KEY_TMDB);
        localStorage.removeItem(LOCAL_STORAGE_KEY_GEMINI);
        localStorage.removeItem(LOCAL_STORAGE_KEY_RATE_LIMIT);
        localStorage.removeItem(LOCAL_STORAGE_KEY_ALL_CLEAR);
    }, []);

    const value = {
        tmdbApiKey,
        geminiApiKey,
        kinocheckApiKey,
        aiClient,
        rateLimit,
        isInitialized,
        isAllClearMode,
        toggleAllClearMode,
        canMakeRequest,
        incrementRequestCount,
        saveApiKeys,
        clearAllSettings,
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};