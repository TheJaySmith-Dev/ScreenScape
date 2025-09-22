import React from 'react';
import { useSettings } from '../hooks/useSettings.ts';
import { LoginIcon } from './icons.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';

export const OnboardingPage: React.FC = () => {
    const { loginWithTmdb, tmdb } = useSettings();

    return (
        <div className="w-screen h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <img 
                src="https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg" // Dune backdrop
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-20 scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d12] via-[#0d0d12]/80 to-[#0d0d12]"></div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-md text-center fade-in">
                <div className="glass-panel p-8 md:p-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                        ScreenScape
                    </h1>
                    <p className="text-gray-300 mb-8">
                        Your ultimate hub for discovering movies and TV shows. Log in with TMDb to unlock your personalized scape.
                    </p>
                    
                    {tmdb.state === 'loading' ? (
                        <div className="flex flex-col items-center justify-center">
                            <LoadingSpinner />
                            <p className="mt-4 text-gray-300">Redirecting to TMDb...</p>
                        </div>
                    ) : (
                         <button
                            onClick={loginWithTmdb}
                            className="w-full glass-button primary text-lg"
                        >
                            <LoginIcon className="w-6 h-6 transform -scale-x-100" />
                            <span>Login with TMDb</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
