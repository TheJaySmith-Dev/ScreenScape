import React, { useState, useEffect, useCallback } from 'react';
import { useSettings } from '../hooks/useSettings.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { CloseIcon, CheckCircleIcon } from './icons.tsx';
import type { DeviceCodeResponse } from '../services/traktService.ts';

interface TraktAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TraktAuthModal: React.FC<TraktAuthModalProps> = ({ isOpen, onClose }) => {
    const { startTraktDeviceAuth, trakt } = useSettings();
    const [authDetails, setAuthDetails] = useState<DeviceCodeResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copyText, setCopyText] = useState('Copy');

    const handleAuthentication = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const details = await startTraktDeviceAuth();
            setAuthDetails(details);
        } catch (err: any) {
            setError(err.message || 'Could not initiate connection. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [startTraktDeviceAuth]);

    useEffect(() => {
        if (isOpen) {
            handleAuthentication();
        } else {
            // Reset state when modal is closed
            setAuthDetails(null);
            setError(null);
            setIsLoading(true);
            setCopyText('Copy');
        }
    }, [isOpen, handleAuthentication]);

    useEffect(() => {
        // If the auth state changes to authenticated while the modal is open,
        // it means the polling was successful.
        if (isOpen && trakt.state === 'authenticated') {
            // The success UI will be shown, then the modal will close.
        }
    }, [trakt.state, isOpen, onClose]);
    
     const handleCopyCode = () => {
        if (authDetails?.user_code) {
            navigator.clipboard.writeText(authDetails.user_code);
            setCopyText('Copied!');
            setTimeout(() => setCopyText('Copy'), 2000);
        }
    };

    if (!isOpen) return null;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-300">Generating connection code...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <h3 className="text-xl font-bold text-red-400">Connection Failed</h3>
                    <p className="text-gray-300 mt-2">{error}</p>
                </div>
            );
        }
        
        if (trakt.state === 'authenticated') {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center fade-in">
                    <CheckCircleIcon className="w-20 h-20 text-green-400 mb-4" />
                    <h3 className="text-2xl font-bold text-white">Connected Successfully!</h3>
                    <p className="text-gray-300 mt-2">Your watchlist will now sync automatically.</p>
                </div>
            );
        }

        if (authDetails) {
            return (
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Connect to Trakt.tv</h2>
                    <p className="text-gray-300 mb-6">To finish connecting, please follow these two steps.</p>
                    <div className="space-y-6">
                        <div className="text-left">
                            <p className="font-semibold text-lg"><span className="text-indigo-400">Step 1:</span> Open the activation page</p>
                            <a 
                                href={authDetails.verification_url}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-block mt-2 w-full text-center px-6 py-3 text-white bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-500/50 rounded-xl font-semibold transition-all duration-300"
                            >
                                Open trakt.tv/activate
                            </a>
                        </div>
                         <div className="text-left">
                            <p className="font-semibold text-lg"><span className="text-indigo-400">Step 2:</span> Enter this code</p>
                            <div className="flex items-center gap-3 mt-2">
                                <p className="flex-grow text-center text-4xl font-bold tracking-widest text-white bg-black/20 border border-white/10 rounded-lg py-2">
                                    {authDetails.user_code}
                                </p>
                                <button onClick={handleCopyCode} className="px-5 py-2 text-sm text-indigo-300 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20 transition-colors">{copyText}</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-3 mt-8 text-gray-400">
                        <LoadingSpinner className="w-5 h-5" />
                        <p>Waiting for authorization...</p>
                    </div>
                </div>
            );
        }
        
        return null;
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[70] p-4 fade-in"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md glass-panel rounded-3xl p-8 min-h-[450px] flex flex-col justify-center fade-in-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full glass-button text-gray-300 hover:text-white transition-colors z-10"
                    aria-label="Close"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>
                {renderContent()}
            </div>
        </div>
    );
};
