import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { GoogleGenAI } from '@google/genai';
import { setLocalTmdbApiKey } from '../services/apiService.ts';
import * as traktService from '../services/traktService.ts';
import type { SettingsContextType, RateLimitState, TraktAuth } from '../types.ts';

const LOCAL_STORAGE_KEY_TMDB = 'screenscape_tmdb_api_key';
const LOCAL_STORAGE_KEY_GEMINI = 'screenscape_gemini_api_key';
const LOCAL_STORAGE_KEY_RATE_LIMIT = 'screenscape_rate_limit';
const LOCAL_STORAGE_KEY_ALL_CLEAR = 'screenscape_all_clear_mode';
const LOCAL_STORAGE_KEY_TRAKT = 'screenscape_trakt_auth';

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

const getInitialTraktAuth = (): TraktAuth => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY_TRAKT);
        if (stored) {
            const state: TraktAuth = JSON.parse(stored);
            if (state.accessToken && state.expiresAt && new Date().getTime() < state.expiresAt) {
                 return { ...state, state: 'authenticated' };
            }
        }
    } catch (e) { console.error("Failed to parse trakt auth state", e); }
    return { accessToken: null, refreshToken: null, expiresAt: null, state: 'idle' };
};

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tmdbApiKey, setTmdbApiKey] = useState<string | null>(null);
    const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
    const [aiClient, setAiClient] = useState<GoogleGenAI | null>(null);
    const [rateLimit, setRateLimit] = useState<RateLimitState>(getInitialRateLimit());
    const [isInitialized, setIsInitialized] = useState(false);
    const [isAllClearMode, setIsAllClearMode] = useState<boolean>(false);
    const [trakt, setTrakt] = useState<TraktAuth>(getInitialTraktAuth());

    useEffect(() => {
        const localTmdbKey = localStorage.getItem(LOCAL_STORAGE_KEY_TMDB);
        const localGeminiKey = localStorage.getItem(LOCAL_STORAGE_KEY_GEMINI);
        const localAllClear = localStorage.getItem(LOCAL_STORAGE_KEY_ALL_CLEAR);
        
        if (localTmdbKey) {
            setTmdbApiKey(localTmdbKey);
            setLocalTmdbApiKey(localTmdbKey);
        }
        if (localAllClear) setIsAllClearMode(JSON.parse(localAllClear));
        
        setGeminiApiKey(localGeminiKey);
        setRateLimit(getInitialRateLimit());
        setTrakt(getInitialTraktAuth());
        
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
        setGeminiApiKey(keys.geminiKey);
        localStorage.setItem(LOCAL_STORAGE_KEY_TMDB, keys.tmdbKey);
        localStorage.setItem(LOCAL_STORAGE_KEY_GEMINI, keys.geminiKey);
    }, []);
    
    const initiateTraktAuth = useCallback(() => {
        setTrakt(prev => ({ ...prev, state: 'loading' }));
        traktService.initiateAuth();
    }, []);

    const handleTraktCallback = useCallback(async (code: string) => {
        setTrakt(prev => ({...prev, state: 'loading' }));
        try {
            const tokenData = await traktService.exchangeCodeForToken(code);
            const expiresAt = (tokenData.created_at + tokenData.expires_in) * 1000;
            const newAuthState: TraktAuth = {
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresAt,
                state: 'authenticated',
            };
            setTrakt(newAuthState);
            localStorage.setItem(LOCAL_STORAGE_KEY_TRAKT, JSON.stringify(newAuthState));
        } catch(e) {
            console.error(e);
            setTrakt({ accessToken: null, refreshToken: null, expiresAt: null, state: 'error' });
            throw e;
        }
    }, []);

    const disconnectTrakt = useCallback(() => {
        const newAuthState: TraktAuth = { accessToken: null, refreshToken: null, expiresAt: null, state: 'idle' };
        setTrakt(newAuthState);
        localStorage.removeItem(LOCAL_STORAGE_KEY_TRAKT);
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
        setTmdbApiKey(null);
        setLocalTmdbApiKey(null);
        setGeminiApiKey(null);
        setAiClient(null);
        setRateLimit({ count: 0, resetTime: newResetTime });
        setIsAllClearMode(false);
        disconnectTrakt();
        
        localStorage.removeItem(LOCAL_STORAGE_KEY_TMDB);
        localStorage.removeItem(LOCAL_STORAGE_KEY_GEMINI);
        localStorage.removeItem(LOCAL_STORAGE_KEY_RATE_LIMIT);
        localStorage.removeItem(LOCAL_STORAGE_KEY_ALL_CLEAR);
    }, [disconnectTrakt]);

    const value = {
        tmdbApiKey,
        geminiApiKey,
        aiClient,
        rateLimit,
        isInitialized,
        isAllClearMode,
        trakt,
        initiateTraktAuth,
        handleTraktCallback,
        disconnectTrakt,
        toggleAllClearMode,
        canMakeRequest,
        incrementRequestCount,
        saveApiKeys,
        clearAllSettings,
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};