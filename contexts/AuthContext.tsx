import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
// FIX: Using Firebase v9 compat syntax.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { auth, googleProvider } from '../services/firebase.ts';
import type { User, AuthContextType } from '../types.ts';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX: Using Firebase v8 onAuthStateChanged method from the auth service instance.
    const unsubscribe = auth.onAuthStateChanged((firebaseUser: firebase.User | null) => {
      if (firebaseUser) {
        setCurrentUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async () => {
    try {
      // FIX: Using Firebase v8 signInWithPopup method from the auth service instance.
      await auth.signInWithPopup(googleProvider);
    } catch (error) {
      console.error("Firebase sign-in error:", error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // FIX: Using Firebase v8 signOut method from the auth service instance.
      await auth.signOut();
    } catch (error) {
      console.error("Firebase sign-out error:", error);
    }
  }, []);

  const value = { 
    currentUser, 
    loading, 
    login, 
    logout 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};