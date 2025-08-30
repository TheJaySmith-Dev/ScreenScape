import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { AuthContextType, User } from '../types.ts';
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';
import * as api from '../services/apiService.ts';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await api.getUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Failed to get current user", error);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = useCallback(async (email: string) => {
    try {
      const user = await api.login(email);
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to login", error);
      // In a real app, you might want to display an error message to the user
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
      setCurrentUser(null);
    } catch (error) {
      console.error("Failed to logout", error);
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
