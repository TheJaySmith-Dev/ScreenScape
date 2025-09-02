import React from 'react';
import type { GameMovie } from '../types.ts';

interface GameCardProps {
    movie: GameMovie;
    showBoxOffice: boolean;
    resultState?: 'correct' | 'incorrect' | null;
}

const formatBoxOffice = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const GameCard: React.FC<GameCardProps> = ({ movie, showBoxOffice, resultState }) => {
    const animationClass = resultState === 'correct' ? 'correct-glow' : resultState === 'incorrect' ? 'incorrect-glow shake' : '';

    return (
        <div 
            className={`relative aspect-[2/3] w-full max-w-[300px] rounded-2xl overflow-hidden bg-black/30 border-2 border-white/20 shadow-lg transition-all duration-500 ${animationClass}`}
        >
            <img 
                src={movie.posterUrl}
                alt={`Poster for ${movie.title}`}
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                <h3 className="text-xl font-bold truncate">{movie.title}</h3>
                <p className="text-sm text-gray-300">{movie.releaseYear}</p>
                {showBoxOffice && (
                    <p className="text-2xl font-semibold mt-2 text-green-300 fade-in" style={{opacity: 0, animationDelay: '200ms'}}>
                        {formatBoxOffice(movie.boxOffice)}
                    </p>
                )}
            </div>
        </div>
    );
};
