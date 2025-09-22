import React, { useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings.ts';
import { LoadingSpinner } from '../../components/LoadingSpinner.tsx';

interface TmdbCallbackPageProps {
  onNavigate: (path: string, replace?: boolean) => void;
}

export const TmdbCallbackPage: React.FC<TmdbCallbackPageProps> = ({ onNavigate }) => {
    const { handleTmdbCallback } = useSettings();

    useEffect(() => {
        const processCallback = async () => {
            const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const requestToken = params.get('request_token');
            const approved = params.get('approved');

            if (requestToken && approved === 'true') {
                try {
                    await handleTmdbCallback(requestToken);
                    onNavigate('/myscape');
                } catch (error) {
                    console.error("TMDb callback failed:", error);
                    // Optionally show an error message to the user here
                    onNavigate('/myscape'); // Navigate back even on error
                }
            } else {
                console.error("TMDb authentication not approved or token missing.");
                onNavigate('/myscape'); // Redirect if auth was denied
            }
        };

        processCallback();
    }, [handleTmdbCallback, onNavigate]);

    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <LoadingSpinner />
            <p className="mt-4 text-gray-300">Finalizing connection...</p>
        </div>
    );
};