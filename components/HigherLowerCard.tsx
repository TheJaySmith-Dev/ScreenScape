import React from 'react';
import type { GameMovie, GameMedia, GameActor } from '../types.ts';

type GameItem = GameMovie | GameMedia | GameActor;
type GameMode = 'box-office' | 'popularity' | 'actor-age';

interface HigherLowerCardProps {
    item: GameItem;
    mode: GameMode;
    showValue: boolean;
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

const formatPopularity = (popularity: number): string => {
    return `Popularity: ${Math.round(popularity)}`;
};

const calculateAge = (birthday: string): number => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const formatAge = (birthday: string): string => {
    return `${calculateAge(birthday)} years old`;
};

const getDisplayValue = (item: GameItem, mode: GameMode): string => {
    switch(mode) {
        case 'box-office':
            return 'boxOffice' in item ? formatBoxOffice(item.boxOffice) : '';
        case 'popularity':
            return 'popularity' in item ? formatPopularity(item.popularity) : '';
        case 'actor-age':
            return 'birthday' in item ? formatAge(item.birthday) : '';
        default:
            return '';
    }
};

export const HigherLowerCard: React.FC<HigherLowerCardProps> = ({ item, mode, showValue, resultState }) => {
    const animationClass = resultState === 'correct' ? 'correct-glow' : resultState === 'incorrect' ? 'incorrect-glow shake' : '';
    
    const isActor = 'birthday' in item;
    const title = isActor ? item.name : item.title;
    const imageUrl = isActor ? item.profileUrl : item.posterUrl;
    const subText = isActor ? 'Actor' : item.releaseYear;
    
    return (
        <div 
            className={`relative aspect-[2/3] w-full max-w-[300px] rounded-2xl overflow-hidden bg-black/30 border-2 border-white/20 shadow-lg transition-all duration-500 ${animationClass}`}
        >
            <img 
                src={imageUrl}
                alt={`Image for ${title}`}
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                <h3 className="text-xl font-bold truncate">{title}</h3>
                <p className="text-sm text-gray-300">{subText}</p>
                {showValue && (
                    <p className="text-2xl font-semibold mt-2 text-green-300 fade-in" style={{opacity: 0, animationDelay: '200ms'}}>
                        {getDisplayValue(item, mode)}
                    </p>
                )}
            </div>
        </div>
    );
};
