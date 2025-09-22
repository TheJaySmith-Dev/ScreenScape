import React, { useEffect, useState } from 'react';
import { useSettings } from '../../hooks/useSettings.ts';
import { LoadingSpinner } from '../../components/LoadingSpinner.tsx';

export const TraktCallbackPage: React.FC = () => {
    const { handleTraktCallback } = useSettings();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const processCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            
            if (code) {
                try {
                    await handleTraktCallback(code);
                    // On success, redirect to the MyScape page
                    window.location.replace('/#/myscape');
                } catch (err) {
                    setError('Authentication failed. Please try again.');
                    console.error(err);
                }
            } else {
                setError('No authorization code found in the callback URL.');
            }
        };

        processCallback();
    }, [handleTraktCallback]);

    return (
        <div className="flex flex-col justify-center items-center h-screen text-center">
            {error ? (
                <div className="text-red-400">
                    <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
                    <p>{error}</p>
                    <a href="/#/myscape" className="mt-4 inline-block px-4 py-2 bg-white/10 rounded-lg">Go Back</a>
                </div>
            ) : (
                <>
                    <LoadingSpinner />
                    <p className="mt-4 text-lg">Authenticating with Trakt...</p>
                </>
            )}
        </div>
    );
};
