import React from 'react';
import { useSettings } from '../hooks/useSettings.ts';

interface TraktAuthButtonProps {
    onClick: () => void;
}

export const TraktAuthButton: React.FC<TraktAuthButtonProps> = ({ onClick }) => {
    const { trakt, disconnectTrakt } = useSettings();

    if (trakt.state === 'authenticated') {
        return (
            <button
                onClick={disconnectTrakt}
                className="w-full px-4 py-2 text-sm text-center text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
            >
                Disconnect Trakt Account
            </button>
        );
    }

    return (
         <button
            onClick={onClick}
            disabled={trakt.state === 'loading'}
            className="w-full px-4 py-2 text-sm text-center bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
        >
            {trakt.state === 'loading' ? 'Connecting...' : 'Connect to Trakt.tv'}
        </button>
    );
};
