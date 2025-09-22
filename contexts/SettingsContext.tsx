import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { GoogleGenAI } from '@google/genai';
import { setLocalTmdbApiKey } from '../services/apiService.ts';
import * as tmdbAuthService from '../services/tmdbAuthService.ts';
import type { SettingsContextType, RateLimitState, TmdbAuth } from '../types.ts';

const LOCAL_STORAGE_KEY_TMDB = 'screenscape_tmdb_api_key';
const LOCAL_STORAGE_KEY_GEMINI = 'screenscape_gemini_api_key';
const LOCAL_STORAGE_KEY_RATE_LIMIT = 'screenscape_rate_limit';
const LOCAL_STORAGE_KEY_ALL_CLEAR = 'screenscape_all_clear_mode';
const LOCAL_STORAGE_KEY_TMDB_AUTH = 'screenscape_tmdb_auth';

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

const getInitialTmdbAuth = (): TmdbAuth => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY_TMDB_AUTH);
        if (stored) {
            const state: TmdbAuth = JSON.parse(stored);
            if (state.sessionId && state.accountDetails) {
                 return { ...state, state: 'authenticated' };
            }
        }
    } catch (e) { console.error("Failed to parse tmdb auth state", e); }
    return { sessionId: null, accountDetails: null, state: 'idle' };
};

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tmdbApiKey, setTmdbApiKey] = useState<string | null>(null);
    const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
    const [aiClient, setAiClient] = useState<GoogleGenAI | null>(null);
    const [rateLimit, setRateLimit] = useState<RateLimitState>(getInitialRateLimit());
    const [isInitialized, setIsInitialized] = useState(false);
    const [isAllClearMode, setIsAllClearMode] = useState<boolean>(false);
    const [tmdb, setTmdb] = useState<TmdbAuth>(getInitialTmdbAuth());

    useEffect(() => {
        const localTmdbKey = localStorage.getItem(LOCAL_STORAGE_KEY_TMDB);
        const localGeminiKey = localStorage.getItem(LOCAL_STORAGE_KEY_GEMINI);
        const localAllClear = localStorage.getItem(LOCAL_STORAGE_KEY_ALL_CLEAR);

        if (localTmdbKey) {
            setTmdbApiKey(localTmdbKey);
            setLocalTmdbApiKey(localTmdbKey);
            tmdbAuthService.setUserV3ApiKey(localTmdbKey);
        }
        if (localAllClear) setIsAllClearMode(JSON.parse(localAllClear));

        setGeminiApiKey(localGeminiKey);
        setRateLimit(getInitialRateLimit());
        setTmdb(getInitialTmdbAuth());

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

    const saveApiKeys = useCallback((keys: { tmdbKey: string; geminiKey: string }) => {
        setTmdbApiKey(keys.tmdbKey);
        setLocalTmdbApiKey(keys.tmdbKey);
        tmdbAuthService.setUserV3ApiKey(keys.tmdbKey);
        setGeminiApiKey(keys.geminiKey);
        localStorage.setItem(LOCAL_STORAGE_KEY_TMDB, keys.tmdbKey);
        localStorage.setItem(LOCAL_STORAGE_KEY_GEMINI, keys.geminiKey);
    }, []);

    const loginWithTmdb = useCallback(async () => {
        setTmdb(prev => ({ ...prev, state: 'loading' }));
        try {
            const requestToken = await tmdbAuthService.createRequestToken();
            const redirectUrl = `${window.location.origin}/callback/tmdb`;
            window.location.href = `https://www.themoviedb.org/authenticate/${requestToken}?redirect_to=${encodeURIComponent(redirectUrl)}`;
        } catch (error) {
            console.error("TMDb login failed to start:", error);
            setTmdb(prev => ({...prev, state: 'error'}));
        }
    }, []);

    const logoutTmdb = useCallback(() => {
        setTmdb({ sessionId: null, accountDetails: null, state: 'idle' });
        localStorage.removeItem(LOCAL_STORAGE_KEY_TMDB_AUTH);
    }, []);

    const handleTmdbCallback = useCallback(async (requestToken: string) => {
        setTmdb(prev => ({ ...prev, state: 'loading' }));
        try {
            const { session_id } = await tmdbAuthService.createSession(requestToken);
            const accountDetails = await tmdbAuthService.getAccountDetails(session_id);
            const newAuthState: TmdbAuth = { sessionId: session_id, accountDetails, state: 'authenticated' };
            setTmdb(newAuthState);
            localStorage.setItem(LOCAL_STORAGE_KEY_TMDB_AUTH, JSON.stringify(newAuthState));
        } catch (error) {
            console.error("Failed to handle TMDb callback:", error);
            logoutTmdb(); // Reset on failure
            throw error;
        }
    }, [logoutTmdb]);

    const toggleAllClearMode = useCallback(() => {
        setIsAllClearMode(prev => {
            const newState = !prev;
            localStorage.setItem(LOCAL_STORAGE_KEY_ALL_CLEAR, JSON.stringify(newState));
            return newState;
        });
    }, []);

    const canMakeRequest = useCallback(() => {
        const now = new Date().getTime();
        if (now > rateLimit.resetTime) return { canRequest: true, resetTime: null };
        if (rateLimit.count < 500) return { canRequest: true, resetTime: null };
        return { canRequest: false, resetTime: rateLimit.resetTime };
    }, [rateLimit]);

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

    const clearAllSettings = useCallback(() => {
        const newResetTime = new Date().setHours(23, 59, 59, 999);
        setTmdbApiKey(null);
        setLocalTmdbApiKey(null);
        tmdbAuthService.setUserV3ApiKey(null);
        setGeminiApiKey(null);
        setAiClient(null);
        setRateLimit({ count: 0, resetTime: newResetTime });
        setIsAllClearMode(false);
        logoutTmdb();

        localStorage.removeItem(LOCAL_STORAGE_KEY_TMDB);
        localStorage.removeItem(LOCAL_STORAGE_KEY_GEMINI);
        localStorage.removeItem(LOCAL_STORAGE_KEY_RATE_LIMIT);
        localStorage.removeItem(LOCAL_STORAGE_KEY_ALL_CLEAR);
    }, [logoutTmdb]);

    const value = {
        tmdbApiKey,
        geminiApiKey,
        saveApiKeys,
        aiClient,
        rateLimit,
        isInitialized,
        isAllClearMode,
        tmdb,
        loginWithTmdb,
        logoutTmdb,
        handleTmdbCallback,
        toggleAllClearMode,
        canMakeRequest,
        incrementRequestCount,
        clearAllSettings,
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
