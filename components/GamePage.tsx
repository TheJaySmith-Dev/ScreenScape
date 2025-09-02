import React, { useState, useEffect, useCallback } from 'react';
import { fetchMoviesForGame } from '../services/mediaService.ts';
import type { GameMovie } from '../types.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { GameCard } from './GameCard.tsx';

type GameState = 'start' | 'loading' | 'playing' | 'revealing' | 'gameover';

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const HIGH_SCORE_KEY = 'watchnow_game_highscore';

export const GamePage: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('loading');
    const [movies, setMovies] = useState<GameMovie[]>([]);
    const [currentMovie, setCurrentMovie] = useState<GameMovie | null>(null);
    const [nextMovie, setNextMovie] = useState<GameMovie | null>(null);
    const [streak, setStreak] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [fetchPage, setFetchPage] = useState(1);
    const [guessResult, setGuessResult] = useState<'correct' | 'incorrect' | null>(null);

    useEffect(() => {
        const savedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
        if (savedHighScore) {
            setHighScore(parseInt(savedHighScore, 10));
        }
        setGameState('start');
    }, []);

    const loadMovies = useCallback(async (page: number) => {
        setGameState('loading');
        try {
            const newMovies = await fetchMoviesForGame(page);
            if (newMovies.length < 5) { // Not enough movies to play
                 setGameState('start');
                 alert("Could not load enough movies to start the game. Please try again later.");
                 return;
            }
            setMovies(prev => shuffleArray([...prev, ...newMovies]));
            setFetchPage(page + 1);
            return newMovies;
        } catch (error) {
            console.error("Failed to load game movies:", error);
            setGameState('start');
        }
    }, []);

    const startGame = useCallback(async () => {
        setStreak(0);
        setGuessResult(null);
        let currentMovies = movies;
        if (movies.length < 5) {
            const loaded = await loadMovies(1);
            if(loaded) currentMovies = loaded;
            else return;
        }
        
        const gameDeck = shuffleArray(currentMovies);
        setCurrentMovie(gameDeck[0]);
        setNextMovie(gameDeck[1]);
        setMovies(gameDeck.slice(2));
        setGameState('playing');
    }, [movies, loadMovies]);

    const handleGuess = (guess: 'higher' | 'lower') => {
        if (gameState !== 'playing' || !currentMovie || !nextMovie) return;

        const isCorrect = guess === 'higher' 
            ? nextMovie.boxOffice >= currentMovie.boxOffice 
            : nextMovie.boxOffice <= currentMovie.boxOffice;
        
        setGuessResult(isCorrect ? 'correct' : 'incorrect');
        setGameState('revealing');

        setTimeout(() => {
            if (isCorrect) {
                setStreak(prev => prev + 1);
                // Prepare for next round
                setCurrentMovie(nextMovie);
                const newDeck = [...movies];
                setNextMovie(newDeck[0]);
                setMovies(newDeck.slice(1));
                setGuessResult(null);
                setGameState('playing');

                if (newDeck.length < 5) { // pre-fetch more movies
                    loadMovies(fetchPage);
                }
            } else {
                if (streak > highScore) {
                    setHighScore(streak);
                    localStorage.setItem(HIGH_SCORE_KEY, String(streak));
                }
                setGameState('gameover');
            }
        }, 2000); // Wait for animation and for user to see result
    };
    
    const renderContent = () => {
        switch (gameState) {
            case 'loading':
                return <LoadingSpinner />;
            case 'start':
            case 'gameover':
                return (
                    <div className="text-center bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-lg mx-auto fade-in">
                        {gameState === 'gameover' && (
                             <h2 className="text-4xl font-bold text-red-400 mb-2">Game Over</h2>
                        )}
                        <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{textShadow: '0 0 15px rgba(255,255,255,0.3)'}}>Higher or Lower</h1>
                        <p className="text-xl text-gray-300 mb-6">Box Office Edition</p>
                        
                        {gameState === 'gameover' && (
                             <p className="text-2xl mb-4">Final Streak: <span className="font-bold text-white">{streak}</span></p>
                        )}
                        <p className="text-lg mb-8">High Score: <span className="font-bold text-yellow-300">{highScore}</span></p>

                        <button
                            onClick={startGame}
                            className="px-8 py-4 text-xl font-bold text-white bg-white/10 border-2 border-white/20 rounded-full hover:bg-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105"
                        >
                           {gameState === 'start' ? 'Play' : 'Play Again'}
                        </button>
                    </div>
                );
            case 'playing':
            case 'revealing':
                if (!currentMovie || !nextMovie) return <LoadingSpinner />;
                return (
                    <div className="w-full flex flex-col items-center gap-8 fade-in">
                        <div className="text-center bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-2">
                             <p className="text-2xl font-bold">Streak: <span className="text-yellow-300">{streak}</span></p>
                        </div>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full">
                            <GameCard movie={currentMovie} showBoxOffice={true} />
                            
                            <div className="text-4xl font-bold text-white/50 hidden md:block">VS</div>

                            <div className="flex flex-col items-center gap-4">
                                <GameCard movie={nextMovie} showBoxOffice={gameState === 'revealing'} resultState={guessResult} />
                                {gameState === 'playing' && (
                                <div className="flex gap-4">
                                    <button onClick={() => handleGuess('higher')} className="px-8 py-3 text-lg font-bold text-white bg-green-500/30 border-2 border-green-500/50 rounded-full hover:bg-green-500/50 transition-colors">Higher 🔼</button>
                                    <button onClick={() => handleGuess('lower')} className="px-8 py-3 text-lg font-bold text-white bg-red-500/30 border-2 border-red-500/50 rounded-full hover:bg-red-500/50 transition-colors">Lower 🔽</button>
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
