import type { LikedItem, DislikedItem } from '../types.ts';

const API_BASE_URL = '/.netlify/functions';

let getAuthToken: () => Promise<string>;

/**
 * Initializes the API service with the function to get the authentication token.
 * This must be called once from the main App component.
 * @param getAccessTokenSilently - The function from the useAuth0 hook.
 */
export const initializeApiService = (getAccessTokenSilently: () => Promise<string>) => {
    getAuthToken = getAccessTokenSilently;
};

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  if (!getAuthToken) {
    throw new Error("ApiService not initialized. Call initializeApiService from your main App component.");
  }
  const token = await getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'An unknown API error occurred' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  if (response.status === 204) {
    return null;
  }

  return response.json();
};


// --- Preferences API ---

interface Preferences {
    likes: LikedItem[];
    dislikes: DislikedItem[];
}

export const getPreferences = async (): Promise<Preferences> => {
    try {
        const prefs = await apiFetch('/preferences', { method: 'GET' });
        return prefs || { likes: [], dislikes: [] };
    } catch (error) {
        console.error("Failed to get preferences:", error);
        // On error, return empty state to prevent app crash
        return { likes: [], dislikes: [] };
    }
};

export const savePreferences = async (likes: LikedItem[], dislikes: DislikedItem[]): Promise<void> => {
    try {
        await apiFetch('/preferences', {
            method: 'POST',
            body: JSON.stringify({ likes, dislikes }),
        });
    } catch (error) {
        console.error("Failed to save preferences:", error);
        throw error;
    }
};