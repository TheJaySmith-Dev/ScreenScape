
import React, { useState } from 'react';
import type { ActorDetails, MediaDetails } from '../types.ts';
import { RecommendationGrid } from './RecommendationGrid.tsx';
import { CloseIcon } from './icons.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';

interface ActorPageProps {
  actor: ActorDetails;
  onBack: () => void;
  onSelectMedia: (media: MediaDetails) => void;
  isLoading: boolean;
}

export const ActorPage: React.FC<ActorPageProps> = ({ actor, onBack, onSelectMedia, isLoading }) => {
  const [showFullBio, setShowFullBio] = useState(false);
  
  const bioWords = actor.biography ? actor.biography.split(' ') : [];
  const canTruncate = bioWords.length > 80;
  const truncatedBio = canTruncate ? bioWords.slice(0, 80).join(' ') + '...' : actor.biography;
  
  const handleSelectFilm = (media: MediaDetails) => {
    onSelectMedia(media);
  };

  return (
    <div className="w-full max-w-4xl glass-panel rounded-[28px] p-6 md:p-8 max-h-[90vh] flex flex-col fade-in-modal relative">
      <button
        onClick={onBack}
        className="absolute top-4 right-4 p-2.5 glass-button !rounded-full z-20"
        aria-label="Close"
      >
        <CloseIcon className="w-6 h-6" />
      </button>

      {isLoading || actor.name === 'Loading...' ? (
        <div className="flex justify-center items-center h-full min-h-[400px]">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="overflow-y-auto media-row pr-2 -mr-4">
          <div className="flex flex-col md:flex-row gap-8 md:gap-10 mb-8">
            <div className="w-full md:w-1/3 flex-shrink-0 mx-auto max-w-[250px] md:max-w-none">
              <img src={actor.profilePath} alt={actor.name} className="w-full rounded-2xl aspect-[2/3] object-cover shadow-lg" />
            </div>
            <div className="w-full">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-white text-center md:text-left">{actor.name}</h1>
              
              <h2 className="text-xl font-semibold mb-2 text-white">Biography</h2>
              <p className="text-gray-300 leading-relaxed text-sm">
                {actor.biography ? (showFullBio ? actor.biography : truncatedBio) : 'No biography available.'}
              </p>
              {canTruncate && (
                <button onClick={() => setShowFullBio(!showFullBio)} className="text-blue-400 hover:text-blue-300 font-semibold mt-2 text-sm">
                  {showFullBio ? 'Read Less' : 'Read More'}
                </button>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Known For</h2>
            {actor.filmography && actor.filmography.length > 0 ? (
                <RecommendationGrid recommendations={actor.filmography} onSelect={handleSelectFilm} />
            ) : (
                <p className="text-gray-400">Filmography not available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
