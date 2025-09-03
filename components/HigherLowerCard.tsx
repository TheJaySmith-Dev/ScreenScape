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

const CrackedGlassSVG = () => (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 300" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 150 L 50 50" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
        <path d="M50 50 L 70 30" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
        <path d="M50 50 L 30 70" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
        <path d="M100 150 L 150 250" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
        <path d="M150 250 L 130 270" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
        <path d="M150 250 L 170 230" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
        <path d="M100 150 L 160 80" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
        <path d="M160 80 L 180 90" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
        <path d="M100 150 L 40 220" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
        <path d="M40 220 L 20 210" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
        <path d="M40 220 L 60 240" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
    </svg>
);


export const HigherLowerCard: React.FC<HigherLowerCardProps> = ({ item, mode, showValue, resultState }) => {
    const animationClass = resultState === 'correct' ? 'correct-glow' : resultState === 'incorrect' ? 'incorrect-glow shake' : '';
    
    const isActor = 'birthday' in item;
    const title = isActor ? item.name : item.title;
    const imageUrl = isActor ? item.profileUrl : item.posterUrl;
    const subText = isActor ? 'Actor' : item.releaseYear;
    
    return (
        <div 
            className={`relative aspect-[2/3] w-full max-w-[300px] glass-panel rounded-3xl shadow-lg transition-all duration-500 ${animationClass}`}
        >
            <img 
                src={imageUrl}
                alt={`Image for ${title}`}
                className="absolute inset-0 w-full h-full object-cover rounded-3xl"
            />
            
            {/* Glossy highlight */}
            <div className="absolute inset-0 rounded-3xl" style={{background: "radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.1), transparent 40%)"}}></div>
            
            {/* Crack Effect */}
            <div className={`crack-overlay ${resultState === 'incorrect' ? 'show-crack' : ''}`}>
                <CrackedGlassSVG />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-4 rounded-3xl" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                <h3 className="text-xl font-bold truncate drop-shadow-lg">{title}</h3>
                <p className="text-sm text-gray-300">{subText}</p>
                {showValue && (
                    <p className="text-2xl font-semibold mt-2 text-cyan-300 drop-shadow-lg fade-in" style={{opacity: 0, animationDelay: '200ms'}}>
                        {getDisplayValue(item, mode)}
                    </p>
                )}
            </div>
        </div>
    );
};