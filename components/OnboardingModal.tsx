import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings.ts';
import { ApiKeyInfoModal } from './ApiKeyInfoModal.tsx';

const ProgressDots: React.FC<{ total: number; current: number; optionalFrom: number }> = ({ total, current, optionalFrom }) => (
    <div className="flex justify-center items-center gap-2 mb-6">
        {Array.from({ length: total }).map((_, i) => (
            <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i < current ? 'bg-indigo-400' : 'bg-white/20'
                } ${i >= optionalFrom ? 'opacity-50' : ''}`}
            />
        ))}
    </div>
);

export const OnboardingModal: React.FC = () => {
    const { tmdbApiKey, geminiApiKey, kinocheckApiKey, saveTmdbApiKey, saveGeminiApiKey, saveKinocheckApiKey } = useSettings();
    const [step, setStep] = useState(tmdbApiKey ? 2 : 1);
    const [tmdbKey, setTmdbKey] = useState(tmdbApiKey || '');
    const [geminiKey, setGeminiKey] = useState(geminiApiKey || '');
    const [kinocheckKey, setKinocheckKey] = useState(kinocheckApiKey || '');
    const [error, setError] = useState('');
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const handleNext = () => {
        if (step === 1) {
            if (tmdbKey.trim().length < 20) {
                setError('Please enter a valid TMDb API Key.');
                return;
            }
            setError('');
            saveTmdbApiKey(tmdbKey.trim());
            setStep(2);
        } else if (step === 2) {
            if (geminiKey.trim().length < 20) {
                setError('Please enter a valid Gemini API Key.');
                return;
            }
            setError('');
            saveGeminiApiKey(geminiKey.trim());
            // Since this is the last required key, we can finish.
            setIsFinished(true);
        }
    };

    const handleSaveOptional = () => {
        if (kinocheckKey.trim().length > 0 && kinocheckKey.trim().length < 20) {
            setError('Please enter a valid KinoCheck API Key or leave it empty to skip.');
            return;
        }
        setError('');
        if (kinocheckKey.trim().length > 0) {
            saveKinocheckApiKey(kinocheckKey.trim());
        }
        setIsFinished(true);
    };

    const handleSkip = () => {
        setIsFinished(true);
    };

    const renderStep = () => {
        // This logic now determines which step to show based on what keys are already present.
        if (!tmdbApiKey) { // Step 1: TMDb
            return (
                <>
                    <h2 className="text-2xl font-bold text-indigo-400 mb-2 text-glow" style={{ "--glow-color": "rgba(129, 140, 248, 0.4)" } as React.CSSProperties}>Welcome to ScreenScape</h2>
                    <p className="text-gray-300 mb-6">Let's set up your API keys. First, you'll need a key from TMDb.</p>
                    <ProgressDots total={3} current={1} optionalFrom={2} />
                    <div className="text-left bg-white/5 p-4 rounded-xl mb-4">
                        <h3 className="font-semibold text-white mb-2">How to get a TMDb API Key:</h3>
                        <ol className="list-decimal list-inside text-gray-300 text-sm space-y-1">
                                <li>Go to <a href="https://www.themoviedb.org/signup" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">The Movie Database (TMDb)</a> and create a free account.</li>
                                <li>Check your email to verify your account.</li>
                                <li>Go to your <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">account settings</a> and click the "API" section.</li>
                                <li>Under "Request an API Key", choose the "Developer" option.</li>
                                <li>Accept the terms and fill out the form (you can use "ScreenScape" for the app name and URL).</li>
                            <li>You'll be given an **API Key (v3 auth)**. Copy and paste it below.</li>
                        </ol>
                    </div>
                    <input
                        type="password"
                        value={tmdbKey}
                        onChange={(e) => setTmdbKey(e.target.value)}
                        placeholder="Enter your TMDb API Key (v3 auth)"
                        className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 focus:outline-none transition-colors placeholder-gray-400"
                    />
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    <button onClick={handleNext} className="w-full mt-6 px-4 py-3 text-white bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-500/50 rounded-xl font-semibold transition-all duration-300">
                        Next
                    </button>
                </>
            );
        } else if (!geminiApiKey) { // Step 2: Gemini
            return (
                 <>
                    <h2 className="text-2xl font-bold text-indigo-400 mb-2 text-glow" style={{ "--glow-color": "rgba(129, 140, 248, 0.4)" } as React.CSSProperties}>Step 2: Google Gemini API Key</h2>
                    <p className="text-gray-300 mb-6">For AI-powered features, you'll need a Google Gemini key.</p>
                    <ProgressDots total={3} current={2} optionalFrom={2} />
                    <div className="text-left bg-white/5 p-4 rounded-xl mb-4">
                        <h3 className="font-semibold text-white mb-2">How to get a Gemini API Key:</h3>
                        <ol className="list-decimal list-inside text-gray-300 text-sm space-y-1">
                                <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google AI Studio</a>.</li>
                                <li>Sign in with your Google account.</li>
                                <li>Click "Get API key" and then "Create API key in new project".</li>
                            <li>Copy the generated key and paste it below.</li>
                        </ol>
                    </div>
                    <input
                        type="password"
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        placeholder="Enter your Gemini API Key"
                        className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 focus:outline-none transition-colors placeholder-gray-400"
                    />
                    <div className="text-sm text-gray-400 mt-2 text-left">
                        Using multiple devices?
                        <button type="button" onClick={() => setIsInfoModalOpen(true)} className="text-indigo-400 hover:underline ml-1 font-semibold">
                            Learn why you might need another key.
                        </button>
                    </div>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    <button onClick={handleNext} className="w-full mt-6 px-4 py-3 text-white bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-500/50 rounded-xl font-semibold transition-all duration-300">
                        Finish Setup
                    </button>
                </>
            );
        } else { // Step 3: KinoCheck (Optional)
            return (
                 <>
                    <h2 className="text-2xl font-bold text-indigo-400 mb-2 text-glow" style={{ "--glow-color": "rgba(129, 140, 248, 0.4)" } as React.CSSProperties}>Optional: KinoCheck API Key</h2>
                    <p className="text-gray-300 mb-6">This key improves trailer searching, but is not required.</p>
                    <ProgressDots total={3} current={3} optionalFrom={2} />
                    <div className="text-left bg-white/5 p-4 rounded-xl mb-4">
                        <h3 className="font-semibold text-white mb-2">How to get a KinoCheck API Key:</h3>
                        <ol className="list-decimal list-inside text-gray-300 text-sm space-y-1">
                                <li>Go to <a href="https://api.kinocheck.com/register" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">KinoCheck API</a> and register.</li>
                            <li>You'll receive an email with your API key.</li>
                            <li>Copy the key from the email and paste it below.</li>
                        </ol>
                    </div>
                    <input
                        type="password"
                        value={kinocheckKey}
                        onChange={(e) => setKinocheckKey(e.target.value)}
                        placeholder="Enter your KinoCheck API Key (Optional)"
                        className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 focus:outline-none transition-colors placeholder-gray-400"
                    />
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    <div className="flex items-center gap-4 mt-6">
                        <button onClick={handleSkip} className="w-full px-4 py-3 text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold transition-all duration-300">
                            Skip for now
                        </button>
                        <button onClick={handleSaveOptional} className="w-full px-4 py-3 text-white bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-500/50 rounded-xl font-semibold transition-all duration-300">
                            Save and Finish
                        </button>
                    </div>
                </>
            );
        }
    };

    // If onboarding is finished, render nothing, allowing the app to reload.
    if (isFinished) {
        return null;
    }

    return (
        <>
            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="w-full max-w-lg text-center glass-panel p-8 rounded-3xl border-indigo-500/30">
                    {renderStep()}
                </div>
            </div>
            {isInfoModalOpen && <ApiKeyInfoModal onClose={() => setIsInfoModalOpen(false)} />}
        </>
    );
};
