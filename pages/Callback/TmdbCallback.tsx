import React, { useEffect, useRef, useState } from 'react';
import { useSettings } from '../../hooks/useSettings.ts';
import { LoadingSpinner } from '../../components/LoadingSpinner.tsx';

interface TmdbCallbackPageProps {
  onNavigate: (path: string, replace?: boolean) => void;
}

export const TmdbCallbackPage: React.FC<TmdbCallbackPageProps> = ({ onNavigate }) => {
    const { handleTmdbCallback } = useSettings();
    const processing = useRef(false);
    const [status, setStatus] = useState('Processing login...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const processCallback = async () => {
            if (processing.current) return;
            processing.current = true;

            const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const requestToken = params.get('request_token');
            const approved = params.get('approved');

            if (requestToken && approved === 'true') {
                try {
                    setStatus('Creating session with TMDb...');
                    await handleTmdbCallback(requestToken);
                    setStatus('Success! Redirecting...');
                    setTimeout(() => onNavigate('/myscape', true), 1500);
                } catch (err: any) {
                    const errorMessage = err.message || 'An unknown error occurred during login.';
                    console.error("TMDb callback failed:", err);
                    setError(`Login failed: ${errorMessage}. Please try again.`);
                    setStatus('Error');
                    // Stay on this page for a few seconds to show the error
                    setTimeout(() => onNavigate('/myscape', true), 5000);
                }
            } else {
                setError("Authentication was not approved or the token is missing from the redirect.");
                setStatus('Error');
                setTimeout(() => onNavigate('/myscape', true), 5000);
            }
        };

        processCallback();
    }, [handleTmdbCallback, onNavigate]);

    return (
        <div className="flex flex-col justify-center items-center h-screen text-center p-4">
            <LoadingSpinner />
            <p className="mt-4 text-gray-300 text-lg">{status}</p>
            {error && (
                <div className="mt-4 max-w-md">
                    <p className="text-red-400 bg-red-500/10 p-3 rounded-lg">{error}</p>
                </div>
            )}
        </div>
    );
};
