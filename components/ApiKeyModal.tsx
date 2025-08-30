import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { verifyTmdbApiKey } from '../services/tmdbService.ts';
import { saveTmdbApiKey } from '../services/apiService.ts';

interface ApiKeyModalProps {
    isOpen: boolean;
    onSave: () => void;
    isDismissable: boolean;
    onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, isDismissable, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        if (!apiKey.trim()) {
            setError('API Key cannot be empty.');
            return;
        }
        setIsLoading(true);
        setError(null);

        const isValid = await verifyTmdbApiKey(apiKey);

        if (isValid) {
            saveTmdbApiKey(apiKey);
            onSave();
        } else {
            setError('The provided API Key is invalid. Please check it and try again.');
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 fade-in" onClick={isDismissable ? onClose : undefined}>
            <div className="relative w-full max-w-md bg-gray-900 border border-white/20 rounded-2xl p-8" onClick={e => e.stopPropagation()}>
                {isDismissable && (
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
                        <CloseIcon className="w-6 h-6"/>
                    </button>
                )}
                
                <h2 className="text-2xl font-bold text-center mb-4">TMDb API Key Required</h2>
                <p className="text-center text-gray-400 text-sm mb-6">
                    This application requires a personal TMDb API key to function. 
                    Please get your free key and enter it below.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        placeholder="Enter your TMDb API Key (v3 auth)"
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-colors"
                    />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="block text-center text-blue-400 hover:underline text-sm">
                        How to get an API Key
                    </a>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <LoadingSpinner className="h-6 w-6"/> : 'Save & Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
};