import React from 'react';
import type { ExternalRatings as ExternalRatingsType } from '../types.ts';
import { ImdbIcon, FreshTomatometerIcon, RottenTomatometerIcon } from './icons.tsx';

interface ExternalRatingsProps {
  ratings?: ExternalRatingsType;
}

const RatingItem: React.FC<{
    icon: React.ReactNode;
    value: string;
    label: string;
}> = ({ icon, value, label }) => (
    <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
        {icon}
        <div>
            <span className="font-bold text-lg">{value}</span>
            <p className="text-xs text-gray-400 -mt-1">{label}</p>
        </div>
    </div>
);

const getMetacriticColor = (score: number): string => {
    if (score >= 61) return 'bg-green-600';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-600';
};

export const ExternalRatings: React.FC<ExternalRatingsProps> = ({ ratings }) => {
    if (!ratings || Object.keys(ratings).length === 0) {
        return null;
    }

    const metacriticScore = ratings.metacritic ? parseInt(ratings.metacritic, 10) : null;
    const rottenTomatoesValue = ratings.rottenTomatoes ? parseInt(ratings.rottenTomatoes.replace('%', ''), 10) : null;
    
    return (
        <div className="flex flex-wrap items-stretch gap-3">
            {ratings.imdb && (
                <RatingItem 
                    icon={<ImdbIcon className="w-8 h-8 text-yellow-400" />}
                    value={ratings.imdb}
                    label="IMDb"
                />
            )}
            {rottenTomatoesValue !== null && !isNaN(rottenTomatoesValue) && (
                <RatingItem 
                    icon={rottenTomatoesValue >= 60 
                        ? <FreshTomatometerIcon className="w-8 h-8" /> 
                        : <RottenTomatometerIcon className="w-8 h-8" />
                    }
                    value={`${rottenTomatoesValue}%`}
                    label="Tomatometer"
                />
            )}
            {metacriticScore !== null && !isNaN(metacriticScore) && (
                <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
                    <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-white text-lg ${getMetacriticColor(metacriticScore)}`}>
                        {metacriticScore}
                    </div>
                    <div>
                        <span className="font-bold text-lg">Score</span>
                        <p className="text-xs text-gray-400 -mt-1">Metacritic</p>
                    </div>
                </div>
            )}
        </div>
    )
};