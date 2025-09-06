import React, { useState, useEffect } from 'react';
import type { ViewingGuide, MediaDetails } from '../types.ts';
import { CloseIcon, SparklesIcon, ArrowPathIcon, ChevronRightIcon } from './icons.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';

interface ViewingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  brandName: string;
  guides: ViewingGuide[];
  onSelectMedia: (media: MediaDetails) => void;
}

export const ViewingGuideModal: React.FC<ViewingGuideModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  brandName,
  guides,
  onSelectMedia,
}) => {
  const [selectedGuideIndex, setSelectedGuideIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      setSelectedGuideIndex(0); // Reset to first guide on open
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

  const selectedGuide = guides[selectedGuideIndex];

  const handleSelectAndClose = (step: any) => {
    // We need to create a minimal MediaDetails object to pass to the handler
    const media: MediaDetails = {
      id: step.mediaId,
      type: step.mediaType,
      title: step.title,
      posterUrl: '', // Not available here, but not needed for selection
      releaseYear: '', // Not available here
      overview: '',
      backdropUrl: '',
      rating: 0,
      trailerUrl: null,
    };
    onSelectMedia(media);
    onClose();
  };

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
            Viewing Guides for {brandName}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : guides.length === 0 ? (
          <p className="text-center text-gray-300 py-12">Could not generate viewing guides for this collection.</p>
        ) : (
          <>
            <div className="flex-shrink-0 mb-6 border-b border-white/10">
              <div className="flex items-center gap-2 overflow-x-auto pb-3 media-row">
                {guides.map((guide, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedGuideIndex(index)}
                    className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
                      index === selectedGuideIndex
                        ? 'bg-white/20 text-white'
                        : 'text-gray-300 bg-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {guide.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto pr-4 -mr-4 media-row">
              {selectedGuide && (
                <>
                  <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                    <ArrowPathIcon className="w-5 h-5" />
                    {selectedGuide.title}
                  </h3>
                  <p className="text-sm text-gray-300 mb-6">{selectedGuide.description}</p>
                  <ol className="space-y-4">
                    {selectedGuide.steps.map((step, index) => (
                      <li key={`${step.mediaId}-${index}`} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white/10 rounded-full font-bold text-lg">{index + 1}</div>
                        <div className="flex-grow">
                            <div 
                                className="flex items-center justify-between cursor-pointer group"
                                onClick={() => handleSelectAndClose(step)}
                            >
                                <h4 className="font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">{step.title}</h4>
                                <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors transform group-hover:translate-x-1" />
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">{step.reasoning}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};