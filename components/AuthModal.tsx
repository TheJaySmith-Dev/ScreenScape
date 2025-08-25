import React, { useState, useEffect } from 'react';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, googleProvider } from '../services/firebase.ts';
import { CloseIcon, GoogleIcon } from './icons.tsx';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthMode = 'login' | 'signup';

const getFirebaseErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Invalid email or password.';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters long.';
        case 'auth/operation-not-allowed':
            return 'Email/password accounts are not enabled.';
        case 'auth/popup-closed-by-user':
            return 'The sign-in popup was closed before completion.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setEmail('');
            setPassword('');
            setError(null);
            setIsLoading(false);
            setMode('login');
        }
    }, [isOpen]);
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            if (mode === 'signup') {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            onClose();
        } catch (err) {
            if (err instanceof FirebaseError) {
                setError(getFirebaseErrorMessage(err.code));
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await signInWithPopup(auth, googleProvider);
            onClose();
        } catch (err) {
            if (err instanceof FirebaseError) {
                setError(getFirebaseErrorMessage(err.code));
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 fade-in" onClick={onClose}>
            <div className="relative w-full max-w-sm bg-gray-900 border border-white/20 rounded-2xl p-8" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
                    <CloseIcon className="w-6 h-6"/>
                </button>
                
                <div className="flex mb-6 border-b border-white/10">
                    <button 
                        onClick={() => setMode('login')} 
                        className={`flex-1 py-2 text-lg font-semibold transition-colors ${mode === 'login' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
                    >
                        Sign In
                    </button>
                    <button 
                        onClick={() => setMode('signup')} 
                        className={`flex-1 py-2 text-lg font-semibold transition-colors ${mode === 'signup' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
                    >
                        Sign Up
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-colors"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-colors"
                    />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-900 text-gray-400">OR</span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/90 hover:bg-white text-gray-800 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                    <GoogleIcon className="w-6 h-6"/>
                    <span>Sign in with Google</span>
                </button>
            </div>
        </div>
    );
};