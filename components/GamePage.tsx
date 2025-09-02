import React, { useState } from 'react';
import { HigherLowerGame } from './HigherLowerGame.tsx';

interface GameModeCardProps {
    title: string;
    description: string;
    onClick: () => void;
    icon: string;
    bgColor: string;
}

const GameModeCard: React.FC<GameModeCardProps> = ({ title, description, onClick, icon, bgColor }) => (
    <div
        onClick={onClick}
        className={`group cursor-pointer rounded-2xl p-6 flex flex-col justify-between aspect-[4/3] transition-all duration-300 transform hover:scale-105 border-2 border-white/20 hover:border-white/40 ${bgColor}`}
    >
        <div>
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            <p className="text-gray-300 mt-1">{description}</p>
        </div>
        <div className="self-end mt-4 text-right font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            Play &rarr;
        </div>
    </div>
);

export const GamePage: React.FC = () => {
    const [activeGame, setActiveGame] = useState<'box-office' | 'popularity' | 'actor-age' | null>(null);

    if (activeGame) {
        return <HigherLowerGame mode={activeGame} onExit={() => setActiveGame(null)} />;
    }

    return (
        <div className="w-full max-w-7xl flex flex-col items-center justify-center min-h-[70vh] fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{textShadow: '0 0 15px rgba(255,255,255,0.3)'}}>CineQuiz</h1>
                <p className="text-lg text-gray-300">Test your movie, TV, and celebrity knowledge.</p>
            </div>
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                <GameModeCard
                    title="Box Office Battle"
                    description="Which movie grossed more?"
                    icon="💰"
                    bgColor="bg-green-500/20 hover:bg-green-500/30"
                    onClick={() => setActiveGame('box-office')}
                />
                <GameModeCard
                    title="Popularity Pulse"
                    description="Which title is more popular?"
                    icon="🔥"
                    bgColor="bg-orange-500/20 hover:bg-orange-500/30"
                    onClick={() => setActiveGame('popularity')}
                />
                <GameModeCard
                    title="Actor Age-Off"
                    description="Which actor is older?"
                    icon="🧑‍🦳"
                    bgColor="bg-blue-500/20 hover:bg-blue-500/30"
                    onClick={() => setActiveGame('actor-age')}
                />
            </div>
        </div>
    );
};