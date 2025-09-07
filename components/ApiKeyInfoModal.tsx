import React from 'react';
import { CloseIcon } from './icons.tsx';

interface ApiKeyInfoModalProps {
  onClose: () => void;
}

export const ApiKeyInfoModal: React.FC<ApiKeyInfoModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-lg text-left glass-panel p-8 rounded-3xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Why Use Multiple API Keys?</h3>
                   <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-white/10" aria-label="Close">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-gray-300 space-y-4">
                    <p>
                        Google AI Studio's free tier for the Gemini API has generous but limited usage rates (requests per minute).
                    </p>
                    <p>
                        Using the same API key across multiple devices at the same time (like on your computer and your phone) can cause these devices to compete for the same rate limit. If you use the app heavily on both, you might hit the free limit, which could lead to temporary errors or potential charges if you have billing enabled on your Google Cloud account.
                    </p>
                    <p>
                        To avoid this and ensure you stay well within the free tier, it's recommended to create a separate, free API key for each device you regularly use with ScreenScape. This app uses the `gemini-2.5-flash` model to minimize usage costs.
                    </p>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="inline-block mt-4 px-4 py-2 text-white bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-500/50 rounded-lg font-semibold transition-all duration-300">
                        Get another Gemini API key
                    </a>
                </div>
            </div>
        </div>
    );
};
