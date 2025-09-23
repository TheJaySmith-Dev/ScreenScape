import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { GoogleGenAI } from '@google/genai';
import { setTmdbApiKey } from '../services/apiKeyManager.ts';
import type { SettingsContextType, RateLimitState, SetupState } from '../types.ts';

const LOCAL_STORAGE_KEY_GEMINI = 'screenscape_gemini_api_key';
const LOCAL_STORAGE_KEY_TMDB = 'screenscape_tmdb_api_key';
const LOCAL_STORAGE_KEY_RATE_LIMIT = 'screenscape_rate_limit';
const LOCAL_STORAGE_KEY_ALL_CLEAR = 'screenscape_all_clear_mode';
const FALLBACK_TMDB_KEY = '09b97a49759876f2fde9eadb163edc44';

const getInitialRateLimit = (): RateLimitState => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY_RATE_LIMIT);
        if (stored) {
            const state: RateLimitState = JSON.parse(stored);
            if (new Date().getTime() > state.resetTime) {
                const newResetTime = new Date().setHours(23, 59, 59, 999);
                return { count: 0, resetTime: newResetTime };
            }
            return state;
        }
    } catch (e) {
        console.error("Failed to parse rate limit state from local storage", e);
    }
    const newResetTime = new Date().setHours(23, 59, 59, 999);
    return { count: 0, resetTime: newResetTime };
};

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
    const [tmdbApiKey, setTmdbApiKeyState] = useState<string | null>(null);
    const [aiClient, setAiClient] = useState<GoogleGenAI | null>(null);
    const [rateLimit, setRateLimit] = useState<RateLimitState>(getInitialRateLimit());
    const [isInitialized, setIsInitialized] = useState(false);
    const [isAllClearMode, setIsAllClearMode] = useState<boolean>(false);
    const [setupState, setSetupState] = useState<SetupState>('needs_tmdb_key');

    useEffect(() => {
        const localGeminiKey = localStorage.getItem(LOCAL_STORAGE_KEY_GEMINI);
        const localTmdbKey = localStorage.getItem(LOCAL_STORAGE_KEY_TMDB) || FALLBACK_TMDB_KEY;
        const localAllClear = localStorage.getItem(LOCAL_STORAGE_KEY_ALL_CLEAR);
        
        if (localAllClear) setIsAllClearMode(JSON.parse(localAllClear));
        
        setGeminiApiKey(localGeminiKey);
        setTmdbApiKeyState(localTmdbKey);
        setTmdbApiKey(localTmdbKey); // Set in manager
        
        setRateLimit(getInitialRateLimit());
        
        // Determine initial setup state
        if (!localTmdbKey) {
            setSetupState('needs_tmdb_key');
        } else {
            setSetupState('complete');
        }
        
        setIsInitialized(true);
    }, []);

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

    const saveGeminiKey = useCallback((key: string) => {
        const trimmedKey = key.trim();
        setGeminiApiKey(trimmedKey || null);
        if (trimmedKey) {
            localStorage.setItem(LOCAL_STORAGE_KEY_GEMINI, trimmedKey);
        } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY_GEMINI);
        }
    }, []);

    const saveTmdbKey = useCallback((key: string) => {
        const trimmedKey = key.trim();
        setTmdbApiKeyState(trimmedKey || null);
        setTmdbApiKey(trimmedKey || null); // Update manager
        if (trimmedKey) {
            localStorage.setItem(LOCAL_STORAGE_KEY_TMDB, trimmedKey);
            setSetupState('complete'); // Setup is complete after getting the key
        } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY_TMDB);
            setSetupState('needs_tmdb_key');
        }
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
        if (now > rateLimit.resetTime) return { canRequest: true, resetTime: null };
        if (rateLimit.count < 500) return { canRequest: true, resetTime: null };
        return { canRequest: false, resetTime: rateLimit.resetTime };
    }, [rateLimit]);

    const clearAllSettings = useCallback(() => {
        const newResetTime = new Date().setHours(23, 59, 59, 999);
        setGeminiApiKey(null);
        setTmdbApiKeyState(null);
        setTmdbApiKey(null);
        setAiClient(null);
        setRateLimit({ count: 0, resetTime: newResetTime });
        setIsAllClearMode(false);
        
        localStorage.removeItem(LOCAL_STORAGE_KEY_GEMINI);
        localStorage.removeItem(LOCAL_STORAGE_KEY_TMDB);
        localStorage.removeItem(LOCAL_STORAGE_KEY_RATE_LIMIT);
        localStorage.removeItem(LOCAL_STORAGE_KEY_ALL_CLEAR);
        localStorage.removeItem('screenscape_tmdb_auth'); // Also remove the old auth key just in case
        setSetupState('needs_tmdb_key');
    }, []);

    const value: SettingsContextType = {
        geminiApiKey,
        tmdbApiKey,
        aiClient,
        rateLimit,
        isInitialized,
        isAllClearMode,
        setupState,
        toggleAllClearMode,
        canMakeRequest,
        incrementRequestCount,
        saveGeminiKey,
        saveTmdbKey,
        clearAllSettings,
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
