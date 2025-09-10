import { useState, useEffect, useCallback } from 'react';

const LOCAL_STORAGE_KEY = 'screenscape_ai_search_history';
const MAX_HISTORY_SIZE = 8;

export const useSearchHistory = () => {
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error("Failed to load search history from local storage:", error);
        }
    }, []);

    const saveHistory = useCallback((newHistory: string[]) => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));
        } catch (error) {
            console.error("Failed to save search history to local storage:", error);
        }
    }, []);

    const addSearch = useCallback((query: string) => {
        const cleanedQuery = query.trim();
        if (!cleanedQuery) return;

        setHistory(prevHistory => {
            // Remove any existing instance of the query to move it to the top
            const filteredHistory = prevHistory.filter(item => item.toLowerCase() !== cleanedQuery.toLowerCase());
            // Add the new query to the beginning and limit the size
            const newHistory = [cleanedQuery, ...filteredHistory].slice(0, MAX_HISTORY_SIZE);
            saveHistory(newHistory);
            return newHistory;
        });
    }, [saveHistory]);

    const clearHistory = useCallback(() => {
        setHistory([]);
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch (error) {
            console.error("Failed to clear search history from local storage:", error);
        }
    }, []);

    return { history, addSearch, clearHistory };
};