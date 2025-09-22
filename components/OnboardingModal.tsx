import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, SparklesIcon, KeyIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon } from './icons.tsx';

interface OnboardingModalProps {
    onSave: (keys: { tmdbKey: string; geminiKey: string; }) => void;
    onClose?: () => void;
    initialTmdbKey?: string;
    initialGeminiKey?: string;
    startOnStep?: number;
}

const StepIndicator: React.FC<{ count: number, current: number }> = ({ count, current }) => (
    <div className="flex items-center justify-center gap-2">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className={`onboarding-step-indicator ${i === current ? 'active' : ''}`} />
        ))}
    </div>
);

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ 
    onSave, 
    onClose, 
    initialTmdbKey = '', 
    initialGeminiKey = '',
    startOnStep = 0
}) => {
    const [step, setStep] = useState(startOnStep);
    const [tmdbKey, setTmdbKey] = useState(initialTmdbKey);
    const [geminiKey, setGeminiKey] = useState(initialGeminiKey);
    const [isTmdbVisible, setIsTmdbVisible] = useState(false);
    const [isGeminiVisible, setIsGeminiVisible] = useState(false);
    const [error, setError] = useState('');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const isTransitioningRef = useRef(false); // Use ref for an immediate, non-stateful lock
    const TOTAL_STEPS = 6;
    const ANIMATION_DURATION = 500; // Must match CSS animation duration

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tmdbKey.trim().length < 20 || geminiKey.trim().length < 20) {
            setError('Please enter what appear to be valid API keys for both TMDb and Gemini.');
            return;
        }
        setError('');
        onSave({
            tmdbKey: tmdbKey.trim(),
            geminiKey: geminiKey.trim(),
        });
    };

    // Combined function to handle step changes to avoid race conditions
    const changeStep = (direction: 'next' | 'prev') => {
        if (isTransitioningRef.current) return; // Immediate lock check
        isTransitioningRef.current = true;

        setIsTransitioning(true); // Triggers visual disabled state
        
        setStep(s => {
            if (direction === 'next') return Math.min(s + 1, TOTAL_STEPS - 1);
            return Math.max(s - 1, 0);
        });
        
        setTimeout(() => {
            isTransitioningRef.current = false;
            setIsTransitioning(false);
        }, ANIMATION_DURATION);
    };
    
    const nextStep = () => changeStep('next');
    const prevStep = () => changeStep('prev');

    const renderStepContent = () => {
        switch (step) {
            case 0: // Welcome
                return (
                    <div className="text-center">
                        <img src="https://i.ibb.co/W4QG4kFf/A221491-C-929-D-44-DD-9-D09-97163-D81-EB61.png" alt="ScreenScape Logo" className="w-24 h-24 mx-auto mb-4" />
                        <h2 className="text-4xl font-bold mb-4">Welcome to ScreenScape</h2>
                        <p className="text-lg text-gray-300 max-w-md mx-auto">Your portal to the cinematic universe. Let's get you set up in a few quick steps.</p>
                    </div>
                );
            case 1: // What is ScreenScape?
                return (
                    <div className="text-center">
                        <SparklesIcon className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-4">What is ScreenScape?</h2>
                        <p className="text-gray-300 max-w-lg mx-auto">ScreenScape is a powerful, AI-enhanced media discovery platform. It uses data from TMDb for content and Google's Gemini AI for features like personalized recommendations, smart search, and content insights.</p>
                    </div>
                );
            case 2: // How to get TMDb Key
                 return (
                    <div className="text-left max-w-lg mx-auto">
                        <h2 className="text-3xl font-bold mb-4 text-center">Get Your TMDb API Key</h2>
                        <ol className="list-decimal list-inside space-y-3 text-gray-300">
                            <li><a href="https://www.themoviedb.org/signup" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-400 hover:underline">Create a free TMDb account</a> if you don't have one.</li>
                            <li>Navigate to your <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-400 hover:underline">Account Settings</a> and click the "API" section.</li>
                            <li>Request an API key for a "Developer" type. It's an instant process.</li>
                            <li>Under your key details, copy the **API Key (v3 auth)**. We'll paste this in the final step.</li>
                        </ol>
                    </div>
                );
            case 3: // How to get Gemini Key
                return (
                     <div className="text-left max-w-lg mx-auto">
                        <h2 className="text-3xl font-bold mb-4 text-center">Get Your Gemini API Key</h2>
                        <ol className="list-decimal list-inside space-y-3 text-gray-300">
                            <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-400 hover:underline">Google AI Studio</a>. You may need to sign in with your Google account.</li>
                            <li>Click **"Create API key in new project"**.</li>
                            <li>Copy your newly generated API key. We'll paste this in the final step.</li>
                            <li className="text-sm text-gray-400">The free tier is very generous, perfect for personal use.</li>
                        </ol>
                    </div>
                );
            case 4: // Why keys?
                return (
                    <div className="text-center">
                        <KeyIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-4">Why Do I Need My Own Keys?</h2>
                        <p className="text-gray-300 max-w-lg mx-auto">ScreenScape is a powerful client-side application. It runs entirely in your browser, which means your data (like API keys and preferences) is stored locally and privately on your device. This gives you full control and privacy.</p>
                    </div>
                );
            case 5: // Form
                return (
                    <div className="text-center w-full max-w-md mx-auto">
                        <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-2">You're All Set!</h2>
                        <p className="text-gray-300 mb-6">Enter your keys below to unlock ScreenScape.</p>
                        <form id="api-key-form" onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
                            <div className="relative">
                                <input
                                    type={isTmdbVisible ? 'text' : 'password'}
                                    value={tmdbKey}
                                    onChange={(e) => setTmdbKey(e.target.value)}
                                    placeholder="Paste your TMDb API Key (v3 auth)"
                                    className="w-full pl-4 pr-12 py-3 text-white bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                                />
                                <button type="button" onClick={() => setIsTmdbVisible(!isTmdbVisible)} className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-white" aria-label="Toggle TMDb key visibility">
                                    {isTmdbVisible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={isGeminiVisible ? 'text' : 'password'}
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    placeholder="Paste your Gemini API Key"
                                    className="w-full pl-4 pr-12 py-3 text-white bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                                />
                                <button type="button" onClick={() => setIsGeminiVisible(!isGeminiVisible)} className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-white" aria-label="Toggle Gemini key visibility">
                                    {isGeminiVisible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
                        </form>
                    </div>
                );
        }
    };
    
    return (
        <div className="onboarding-backdrop">
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div 
                    className="w-full max-w-2xl text-center glass-panel p-8 md:p-12 rounded-3xl border-indigo-500/30 flex flex-col items-center justify-between min-h-[450px]"
                >
                    {onClose && (
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 glass-panel !rounded-full" aria-label="Close">
                            <CloseIcon className="w-5 h-5"/>
                        </button>
                    )}
                    
                    <div className="w-full flex items-center justify-center flex-grow animate-[slideInFromBottom_0.5s_ease-out_forwards]" style={{opacity: 0}} key={step}>
                        {renderStepContent()}
                    </div>

                    <div className="mt-8 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                        <StepIndicator count={TOTAL_STEPS} current={step} />
                        <div className="flex items-center gap-3">
                            {step > 0 && startOnStep === 0 && (
                                <button 
                                    type="button" 
                                    onClick={prevStep} 
                                    disabled={isTransitioning}
                                    className="px-6 py-2.5 text-sm font-semibold text-gray-300 bg-white/5 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
                                >
                                    Back
                                </button>
                            )}
                            {step < TOTAL_STEPS - 1 ? (
                                <button 
                                    type="button" 
                                    onClick={nextStep} 
                                    disabled={isTransitioning}
                                    className="px-8 py-2.5 text-sm font-semibold text-black bg-white rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    Next
                                </button>
                            ) : (
                                <button 
                                    type="submit" 
                                    form="api-key-form" 
                                    className="px-8 py-2.5 text-sm font-semibold text-black bg-white rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    Finish Setup
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};