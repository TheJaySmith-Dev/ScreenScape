import React, { useEffect } from 'react';
import { CloseIcon, SparklesIcon } from './icons.tsx';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[70] p-4 fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl glass-panel rounded-3xl p-8 max-h-[80vh] flex flex-col fade-in-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full glass-panel text-gray-300 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-4">App Guide</h2>

        <div className="overflow-y-auto pr-4 -mr-4 media-row guide-modal-content">
          <h3>Getting Started: API Keys</h3>
          <p>
            This app requires two free API keys to function: one for movie data and one for AI features.
          </p>
          <ul>
            <li>
              <strong>TMDb API Key:</strong> Used to fetch all movie/TV show information, posters, and trailers. You can get one from{' '}
              <a href="https://www.themoviedb.org/signup" target="_blank" rel="noopener noreferrer">themoviedb.org</a>.
            </li>
            <li>
              <strong>Gemini API Key:</strong> Powers all AI features like AI Search, Behind-the-Scenes Facts, and the "Ask" chatbot. You can get one from{' '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>.
            </li>
          </ul>
          <p className="mt-2">
            The first time you open the app, you will be prompted to enter these keys. They are saved securely in your account if you are signed in, or just in your browser for local use.
          </p>

          <h3>AI-Powered Features</h3>
          <p>
            The AI features are designed to enhance your discovery experience.
          </p>
          <ul>
            <li><strong>AI Search:</strong> Use natural language to find exactly what you're in the mood for. Try "a mind-bending sci-fi movie from A24" or "a funny movie starring Ryan Reynolds".</li>
            <li><strong>Behind-the-Scenes Facts:</strong> On any movie's detail page, click "More Info" and then "Generate Behind-the-Scenes Facts" for interesting trivia.</li>
            <li><strong>Ask Chatbot:</strong> Click the "Ask" button on a detail page to open a chat and ask specific questions about that movie or show.</li>
          </ul>

          <h3>Daily Usage Limit</h3>
          <p>
            To prevent unexpected costs on your Gemini API key, there is a built-in limit of <strong>500 AI requests per day</strong>. Each time you use an AI feature, it counts as one request.
          </p>
          <p className="mt-2">
            If you sign in, this limit is synced across all your devices. If you reach the limit, AI features will be temporarily disabled, and a countdown will show when you can use them again.
          </p>

          <h3>How to Ask for Changes</h3>
          <p>
            Think of me as your personal engineer! To help me understand your request, please be as descriptive as possible.
          </p>
          <ul>
            <li><strong>For a new feature:</strong> Describe what you want the feature to do, how you imagine it looking, and where it should go in the app.</li>
            <li><strong>For a bug or error:</strong> Tell me what you were doing when the error occurred, what you expected to happen, and what happened instead.</li>
            <li><strong>For a design change:</strong> Explain what you'd like to change and why. For example, "Can you make the movie posters larger?" or "I'd prefer a darker theme."</li>
          </ul>
        </div>
      </div>
    </div>
  );
};