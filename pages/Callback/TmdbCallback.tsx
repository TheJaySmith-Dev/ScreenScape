import React, { useEffect, useRef } from 'react';
import { useSettings } from '../../hooks/useSettings.ts';
import { LoadingSpinner } from '../../components/LoadingSpinner.tsx';

interface TmdbCallbackPageProps {
  onNavigate: (path: string, replace?: boolean) => void;
}

export const TmdbCallbackPage: React.FC<TmdbCallbackPageProps> = ({ onNavigate }) => {
    const { handleTmdbCallback } = useSettings();
    const processing = useRef(false);

    useEffect(() => {
        const processCallback = async () => {
            if (processing.current) return;
            processing.current = true;

            const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const requestToken = params.get('request_token');
            const approved = params.get('approved');

            if (requestToken && approved === 'true') {
                try {
                    await handleTmdbCallback(requestToken);
                    onNavigate('/myscape', true);
                } catch (error) {
                    console.error("TMDb callback failed:", error);
                    // Optionally show an error message to the user here
                    onNavigate('/myscape', true); // Navigate back even on error
                }
            } else {
                console.error("TMDb authentication not approved or token missing.");
                onNavigate('/myscape', true); // Redirect if auth was denied
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
