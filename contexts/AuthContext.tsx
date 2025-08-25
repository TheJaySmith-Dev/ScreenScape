import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { AuthContextType, User } from '../types.ts';
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const LOCAL_STORAGE_KEY = 'watchnow_user';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from local storage", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  const login = useCallback((email: string) => {
    // Create a simple user object
    const user: User = {
      email,
      displayName: email.split('@')[0],
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to save user to local storage", error);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setCurrentUser(null);
    } catch (error) {
      console.error("Failed to remove user from local storage", error);
    }
  }, []);

  const value = {
    currentUser,
    loading,
    login,
    logout,
  };
  
  if (loading) {
    return (
        <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
            <LoadingSpinner />
        </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
