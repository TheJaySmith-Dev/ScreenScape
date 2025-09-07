import React from 'react';

export const SignInPrompt: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)] fade-in">
            <div className="text-center p-8 glass-panel rounded-2xl max-w-lg">
                <h2 className="text-3xl font-bold text-white mb-4">Welcome to ScreenScape</h2>
                <p className="text-gray-300 mb-6">
                    Sign in to discover personalized movie and TV show recommendations, create your watchlist, and explore a universe of entertainment.
                </p>
                <p className="text-gray-400">
                    Please use the "Sign In" button in the top-right corner to begin.
                </p>
            </div>
        </div>
    );
};
