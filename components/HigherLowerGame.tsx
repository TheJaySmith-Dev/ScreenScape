import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchMoviesForGame, fetchMediaForPopularityGame, fetchActorsForAgeGame } from '../services/mediaService.ts';
import type { GameMovie, GameMedia, GameActor } from '../types.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { HigherLowerCard } from './HigherLowerCard.tsx';

type GameMode = 'box-office' | 'popularity' | 'actor-age';
type GameItem = GameMovie | GameMedia | GameActor;
type GameState = 'start' | 'loading' | 'playing' | 'revealing' | 'gameover';

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const HIGH_SCORE_KEYS: Record<GameMode, string> = {
    'box-office': 'screenscape_game_hs_boxoffice',
    'popularity': 'screenscape_game_hs_popularity',
    'actor-age': 'screenscape_game_hs_age',
};

interface HigherLowerGameProps {
    mode: GameMode;
    onExit: () => void;
}

export const HigherLowerGame: React.FC<HigherLowerGameProps> = ({ mode, onExit }) => {
    const [gameState, setGameState] = useState<GameState>('loading');
    const [items, setItems] = useState<GameItem[]>([]);
    const [currentItem, setCurrentItem] = useState<GameItem | null>(null);
    const [nextItem, setNextItem] = useState<GameItem | null>(null);
    const [streak, setStreak] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [fetchPage, setFetchPage] = useState(1);
    const [guessResult, setGuessResult] = useState<'correct' | 'incorrect' | null>(null);

    const gameDetails = useMemo(() => {
        switch (mode) {
            case 'box-office':
                return { title: 'Box Office Battle', fetcher: fetchMoviesForGame };
            case 'popularity':
                return { title: 'Popularity Pulse', fetcher: fetchMediaForPopularityGame };
            case 'actor-age':
                return { title: 'Actor Age-Off', fetcher: fetchActorsForAgeGame };
        }
    }, [mode]);

    useEffect(() => {
        const savedHighScore = localStorage.getItem(HIGH_SCORE_KEYS[mode]);
        if (savedHighScore) {
            setHighScore(parseInt(savedHighScore, 10));
        }
        setGameState('start');
    }, [mode]);

    const loadItems = useCallback(async (page: number) => {
        setGameState('loading');
        try {
            const newItems = await gameDetails.fetcher(page);
            if (newItems.length < 2) {
                 setGameState('start');
                 alert("Could not load enough content to start the game. Please try again later.");
                 onExit();
                 return;
            }
            setItems(prev => shuffleArray([...prev, ...newItems]));
            setFetchPage(page + 1);
            return newItems;
        } catch (error) {
            console.error(`Failed to load game items for mode ${mode}:`, error);
            setGameState('start');
        }
    }, [gameDetails, mode, onExit]);

    const startGame = useCallback(async () => {
        setStreak(0);
        setGuessResult(null);
        let currentItems = items;
        if (items.length < 5) {
            const loaded = await loadItems(1);
            if (loaded) {
                currentItems = loaded;
            } else {
                return;
            }
        }
        
        const gameDeck = shuffleArray(currentItems);
        setCurrentItem(gameDeck[0]);
        setNextItem(gameDeck[1]);
        setItems(gameDeck.slice(2));
        setGameState('playing');
    }, [items, loadItems]);

    const getItemValue = (item: GameItem): number => {
        if ('boxOffice' in item) return item.boxOffice;
        if ('popularity' in item) return item.popularity;
        if ('birthday' in item) {
            return new Date(item.birthday).getTime();
        }
        return 0;
    };

    const handleGuess = (guess: 'higher' | 'lower') => {
        if (gameState !== 'playing' || !currentItem || !nextItem) return;

        const currentValue = getItemValue(currentItem);
        const nextValue = getItemValue(nextItem);
        
        let isCorrect: boolean;
        if (mode === 'actor-age') { // For age, a smaller birthday timestamp means older
            isCorrect = guess === 'higher' ? nextValue <= currentValue : nextValue >= currentValue;
        } else { // For box office and popularity, higher number is higher
            isCorrect = guess === 'higher' ? nextValue >= currentValue : nextValue <= currentValue;
        }
        
        setGuessResult(isCorrect ? 'correct' : 'incorrect');
        setGameState('revealing');

        setTimeout(() => {
            if (isCorrect) {
                setStreak(prev => prev + 1);
                setCurrentItem(nextItem);
                const newDeck = [...items];
                setNextItem(newDeck[0]);
                setItems(newDeck.slice(1));
                setGuessResult(null);
                setGameState('playing');

                if (newDeck.length < 5) {
                    loadItems(fetchPage);
                }
            } else {
                if (streak > highScore) {
                    setHighScore(streak);
                    localStorage.setItem(HIGH_SCORE_KEYS[mode], String(streak));
                }
                setGameState('gameover');
            }
        }, 2000);
    };
    
    const renderContent = () => {
        switch (gameState) {
            case 'loading':
                return <LoadingSpinner />;
            case 'start':
            case 'gameover':
                return (
                    <div className="text-center bg-white/30 backdrop-blur-md border border-black/10 rounded-2xl p-8 max-w-lg mx-auto fade-in">
                        {gameState === 'gameover' && (
                             <h2 className="text-4xl font-bold text-red-500 mb-2">Game Over</h2>
                        )}
                        <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{textShadow: '0 0 15px rgba(0,0,0,0.1)'}}>{gameDetails.title}</h1>
                        
                        {gameState === 'gameover' && (
                             <p className="text-2xl mb-4">Final Streak: <span className="font-bold text-gray-800">{streak}</span></p>
                        )}
                        <p className="text-lg mb-8">High Score: <span className="font-bold text-yellow-500">{highScore}</span></p>

                        <div className="flex gap-4 justify-center">
                            <button onClick={onExit} className="px-6 py-3 text-lg font-bold bg-black/5 border-2 border-black/10 rounded-full hover:bg-black/10 transition-colors">Back to CineQuiz</button>
                            <button
                                onClick={startGame}
                                className="px-8 py-3 text-lg font-bold bg-black/10 border-2 border-black/20 rounded-full hover:bg-black/20 transition-all duration-300"
                            >
                               {gameState === 'start' ? 'Play' : 'Play Again'}
                            </button>
                        </div>
                    </div>
                );
            case 'playing':
            case 'revealing':
                if (!currentItem || !nextItem) return <LoadingSpinner />;
                return (
                    <div className="w-full flex flex-col items-center gap-6 fade-in">
                        <div className="flex items-center gap-6">
                            <button onClick={onExit} className="px-4 py-2 text-sm bg-black/5 hover:bg-black/10 rounded-full transition-colors">&larr; Exit</button>
                            <div className="text-center bg-white/30 backdrop-blur-md border border-black/10 rounded-2xl px-6 py-2">
                                <p className="text-2xl font-bold">Streak: <span className="text-yellow-500">{streak}</span></p>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full">
                            <HigherLowerCard item={currentItem} mode={mode} showValue={true} />
                            
                            <div className="text-4xl font-bold text-black/50 hidden md:block">VS</div>

                            <div className="flex flex-col items-center gap-4">
                                <HigherLowerCard item={nextItem} mode={mode} showValue={gameState === 'revealing'} resultState={guessResult} />
                                {gameState === 'playing' && (
                                <div className="flex gap-4">
                                    <button onClick={() => handleGuess('higher')} className="px-8 py-3 text-lg font-bold text-white bg-green-500/80 border-2 border-green-600/80 rounded-full hover:bg-green-500 transition-colors">Higher 🔼</button>
                                    <button onClick={() => handleGuess('lower')} className="px-8 py-3 text-lg font-bold text-white bg-red-500/80 border-2 border-red-600/80 rounded-full hover:bg-red-500 transition-colors">Lower 🔽</button>
                                </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="w-full max-w-7xl flex flex-col items-center justify-center min-h-[70vh]">
            {renderContent()}
        </div>
    );
};