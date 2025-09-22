import React, { useState, useEffect } from 'react';
import type { TraktStats, MediaDetails } from '../types.ts';
import { useSettings } from '../hooks/useSettings.ts';
import * as traktService from '../services/traktService.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';

interface TraktActivityProps {
  media: MediaDetails;
}

const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short'
    }).format(num);
};

const StatItem: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="text-center">
        <p className="font-bold text-lg text-white">{formatNumber(value)}</p>
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
);

export const TraktActivity: React.FC<TraktActivityProps> = ({ media }) => {
    const { trakt } = useSettings();
    const [stats, setStats] = useState<TraktStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (trakt.state !== 'authenticated' || !trakt.accessToken) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const fetchedStats = await traktService.getTraktStats(media.id, media.type, trakt.accessToken);
                setStats(fetchedStats);
            } catch (error) {
                console.error('Failed to fetch Trakt stats', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [media.id, media.type, trakt.accessToken, trakt.state]);
    
    if (trakt.state !== 'authenticated') {
        return null; // Don't show this component if user is not logged into Trakt
    }

    if (isLoading) {
        return (
            <div className="p-4 rounded-lg bg-white/5 min-h-[80px] flex items-center justify-center">
                <LoadingSpinner className="w-6 h-6" />
            </div>
        );
    }
    
    if (!stats) {
        return null;
    }

    return (
        <div className="p-4 rounded-lg bg-white/5 space-y-4">
            <div className="flex justify-around items-center">
                <StatItem label="Watchers" value={stats.watchers} />
                <StatItem label="Plays" value={stats.plays} />
                <StatItem label="Collectors" value={stats.collectors} />
                <StatItem label="Lists" value={stats.lists} />
            </div>
             <a
                href={`https://trakt.tv/${media.type === 'tv' ? 'shows' : 'movies'}/${media.imdbId || media.id}/watch`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center w-full p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors duration-200 text-sm font-medium text-gray-200"
            >
                More streaming options on Trakt
            </a>
        </div>
    );
};
