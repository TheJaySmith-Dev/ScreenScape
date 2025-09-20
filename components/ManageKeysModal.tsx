import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings.ts';
import { CloseIcon } from './icons.tsx';

interface ManageKeysModalProps {
  onClose: () => void;
}

export const ManageKeysModal: React.FC<ManageKeysModalProps> = ({ onClose }) => {
    const { tmdbApiKey, geminiApiKey, kinocheckApiKey, saveTmdbApiKey, saveGeminiApiKey, saveKinocheckApiKey } = useSettings();
    const [tmdbKey, setTmdbKey] = useState(tmdbApiKey || '');
    const [geminiKey, setGeminiKey] = useState(geminiApiKey || '');
    const [kinocheckKey, setKinocheckKey] = useState(kinocheckApiKey || '');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tmdbKey.trim().length < 20 || geminiKey.trim().length < 20) {
            setError('Please enter valid API keys for TMDb and Gemini.');
            return;
        }
        if (kinocheckKey.trim().length > 0 && kinocheckKey.trim().length < 20) {
            setError('Please enter a valid KinoCheck API Key or leave it empty.');
            return;
        }
        setError('');
        saveTmdbApiKey(tmdbKey.trim());
        saveGeminiApiKey(geminiKey.trim());
        saveKinocheckApiKey(kinocheckKey.trim());
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-lg text-center glass-panel p-8 rounded-3xl border-indigo-500/30" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-indigo-400 text-glow" style={{ "--glow-color": "rgba(129, 140, 248, 0.4)" } as React.CSSProperties}>Manage API Keys</h2>
                    <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-white/10" aria-label="Close">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-gray-300 mb-6">
                    Update your API keys below. Your keys are saved locally in this browser.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="password"
                        value={tmdbKey}
                        onChange={(e) => setTmdbKey(e.target.value)}
                        placeholder="Enter your TMDb API Key (v3 auth)"
                        className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 focus:outline-none transition-colors placeholder-gray-400"
                        aria-label="TMDb API Key"
                    />
                    <input
                        type="password"
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        placeholder="Enter your Gemini API Key"
                        className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 focus:outline-none transition-colors placeholder-gray-400"
                        aria-label="Gemini API Key"
                    />
                    <input
                        type="password"
                        value={kinocheckKey}
                        onChange={(e) => setKinocheckKey(e.target.value)}
                        placeholder="Enter your KinoCheck API Key (Optional)"
                        className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 focus:outline-none transition-colors placeholder-gray-400"
                        aria-label="KinoCheck API Key"
                    />
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    <button
                        type="submit"
                        className="w-full mt-4 px-4 py-3 text-white bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-500/50 rounded-xl font-semibold transition-all duration-300 disabled:bg-gray-500/20"
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};
