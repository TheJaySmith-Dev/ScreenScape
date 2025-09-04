import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import { CloseIcon } from './icons.tsx';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setEmail('');
            setIsLoading(false);
        }
    }, [isOpen]);
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Add body scroll lock when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
        }
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !email.includes('@')) return;
        setIsLoading(true);
        await login(email);
        setIsLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 fade-in" onClick={onClose}>
            <div className="relative w-full max-w-sm glass-panel rounded-3xl p-8" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full glass-panel text-gray-300 hover:text-white transition-colors">
                    <CloseIcon className="w-6 h-6"/>
                </button>
                
                {/* FIX: Cast style object to React.CSSProperties to allow for custom CSS variables. */}
                <h2 className="text-2xl font-bold text-center mb-6 text-white text-glow" style={{ "--glow-color": "rgba(129, 140, 248, 0.4)" } as React.CSSProperties}>Sign In</h2>
                <p className="text-center text-gray-300 text-sm mb-6">Enter your email to sign in. No password required.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 focus:outline-none transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-indigo-500/30 text-white hover:bg-indigo-500/50 border border-indigo-500/50 rounded-xl font-semibold transition-all duration-300 disabled:bg-gray-500/20 disabled:border-gray-500/50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};