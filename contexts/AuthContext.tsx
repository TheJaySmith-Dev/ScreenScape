import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLogto } from '@logto/react';
import type { User, AuthContextType } from '../types.ts';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { 
    isAuthenticated, 
    isLoading: isLogtoLoading, 
    signIn, 
    signOut, 
    getIdTokenClaims 
  } = useLogto();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const getUserInfo = async () => {
      if (isAuthenticated) {
        try {
          if (typeof getIdTokenClaims === 'function') {
            const claims = await getIdTokenClaims();
            if (claims?.email && claims?.name) {
              setCurrentUser({
                email: claims.email,
                displayName: claims.name,
                photoURL: claims.picture,
              });
            }
          }
        } catch (error) {
          console.error("Failed to get user info from Logto ID token:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };
    
    if (!isLogtoLoading) {
        getUserInfo();
    }
  }, [isAuthenticated, isLogtoLoading, getIdTokenClaims]);

  const login = useCallback(async () => {
    if (typeof signIn === 'function') {
      await signIn(`${window.location.origin}/#/callback`);
    }
  }, [signIn]);

  const logout = useCallback(async () => {
    if (typeof signOut === 'function') {
      await signOut(window.location.origin);
    }
  }, [signOut]);

  const value = { 
    currentUser, 
    loading: isLogtoLoading, 
    login, 
    logout 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};