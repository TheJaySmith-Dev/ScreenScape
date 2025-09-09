

import React, { useState } from 'react';
import type { ActorDetails, MediaDetails } from '../types.ts';
import { RecommendationGrid } from './RecommendationGrid.tsx';
import { CakeIcon, LocationMarkerIcon, HomeIcon, CloseIcon } from './icons.tsx';

interface ActorPageProps {
  actor: ActorDetails;
  onBack: () => void;
  onSelectMedia: (media: MediaDetails) => void;
}

const ActorInfo: React.FC<{ icon: React.ReactNode; label: string; value: string | null }> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-1">{icon}</div>
      <div>
        <p className="font-semibold text-gray-200">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
};

export const ActorPage: React.FC<ActorPageProps> = ({ actor, onBack, onSelectMedia }) => {
  const [showFullBio, setShowFullBio] = useState(false);
  const [isFilmographyModalOpen, setIsFilmographyModalOpen] = useState(false);
  const bioWords = actor.biography.split(' ');
  const canTruncate = bioWords.length > 100;
  const truncatedBio = canTruncate ? bioWords.slice(0, 100).join(' ') + '...' : actor.biography;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };
  
  const handleSelectFilm = (media: MediaDetails) => {
    onSelectMedia(media);
    setIsFilmographyModalOpen(false);
  };

  return (
    <>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="px-4 py-2 text-sm text-gray-200 glass-panel rounded-full hover:bg-white/5 transition-colors">&larr; Back</button>
          <a href="#/home" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 glass-panel rounded-full hover:bg-white/5 transition-colors">
              <HomeIcon className="w-4 h-4" />
              <span>Home</span>
          </a>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-12 md:mb-16">
          <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mx-auto max-w-xs">
            <img src={actor.profilePath} alt={actor.name} className="w-full rounded-2xl aspect-[2/3] object-cover shadow-lg" />
          </div>
          <div className="w-full">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-white text-center md:text-left">{actor.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4 mb-6">
              <ActorInfo icon={<CakeIcon className="w-5 h-5" />} label="Birthday" value={formatDate(actor.birthday)} />
              <ActorInfo icon={<LocationMarkerIcon className="w-5 h-5" />} label="Place of Birth" value={actor.placeOfBirth} />
            </div>
            
            <h2 className="text-xl font-semibold mb-2 text-white">Biography</h2>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
              {showFullBio ? actor.biography : truncatedBio}
            </p>
            {canTruncate && (
              <button onClick={() => setShowFullBio(!showFullBio)} className="text-blue-400 hover:text-blue-300 font-semibold mt-2">
                {showFullBio ? 'Read Less' : 'Read More'}
              </button>
            )}
            
            {actor.filmography && actor.filmography.length > 0 && (
                <div className="mt-8">
                    <button
                        onClick={() => setIsFilmographyModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 glass-panel rounded-xl text-white font-semibold transition-all duration-300 hover:bg-white/5 hover:scale-105"
                    >
                        View Filmography
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>

      {isFilmographyModalOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-lg z-[60] flex items-center justify-center p-4 fade-in"
            onClick={() => setIsFilmographyModalOpen(false)}
          >
            <div
              className="w-full max-w-5xl glass-panel rounded-3xl p-6 md:p-8 max-h-[85vh] flex flex-col fade-in-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <h2 className="text-2xl font-bold text-white">Filmography: {actor.name}</h2>
                <button
                  onClick={() => setIsFilmographyModalOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10"
                  aria-label="Close"
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="overflow-y-auto media-row pr-2 -mr-4">
                <RecommendationGrid recommendations={actor.filmography} onSelect={handleSelectFilm} />
              </div>
            </div>
          </div>
      )}
    </>
  );
};
