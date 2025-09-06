import React, { useEffect } from 'react';
import { CloseIcon, SparklesIcon } from './icons.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';

interface AiDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  title: string;
  description: string | null;
  error: string | null;
}

export const AiDescriptionModal: React.FC<AiDescriptionModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  title,
  description,
  error,
}) => {
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
      if (event.key === 'Escape') {
        onClose();
      }
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

        <div className="flex items-center gap-3 mb-4">
          <SparklesIcon className="w-6 h-6 text-indigo-400" />
          <h2 className="text-2xl font-bold text-white text-glow" style={{ '--glow-color': 'rgba(129, 140, 248, 0.4)' } as React.CSSProperties}>
            AI Insights for {title}
          </h2>
        </div>

        <div className="overflow-y-auto pr-4 -mr-4 media-row">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : (
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};
