import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as api from '../services/apiService.ts';
import type { User, AuthContextType } from '../types.ts';

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
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to get user", error);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = useCallback(async (email: string) => {
    try {
      setLoading(true);
      const user = await api.login(email);
      setCurrentUser(user);
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await api.logout();
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = { currentUser, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
