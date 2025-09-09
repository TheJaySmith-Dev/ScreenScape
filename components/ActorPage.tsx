

import React, { useState } from 'react';
import type { ActorDetails, MediaDetails } from '../types.ts';
import { RecommendationCard } from './RecommendationCard.tsx';
import { CakeIcon, LocationMarkerIcon, HomeIcon, ChevronUpIcon } from './icons.tsx';

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
  const [isFilmographyOpen, setIsFilmographyOpen] = useState(false);
  const bioWords = actor.biography.split(' ');
  const canTruncate = bioWords.length > 100;
  const truncatedBio = canTruncate ? bioWords.slice(0, 100).join(' ') + '...' : actor.biography;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 fade-in pb-32">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="px-4 py-2 text-sm text-gray-200 glass-panel rounded-full hover:bg-white/5 transition-colors">&larr; Back</button>
        <a href="#/home" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 glass-panel rounded-full hover:bg-white/5 transition-colors">
            <HomeIcon className="w-4 h-4" />
            <span>Home</span>
        </a>
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-12 md:mb-16">
        <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mx-auto max-w-xs">
          <img src={actor.profilePath} alt={actor.name} className="w-full rounded-2xl aspect-[2/3] object-cover" />
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
        </div>
      </div>

      {actor.filmography && actor.filmography.length > 0 && (
        <div 
          className={`fixed bottom-0 left-0 right-0 z-20 transition-transform duration-500 ease-in-out ${
            isFilmographyOpen ? 'translate-y-0' : 'translate-y-[calc(100%-5rem)]'
          }`}
        >
          <div className="w-full max-w-7xl mx-auto px-4">
            <div className="glass-panel rounded-t-2xl max-h-[50vh] flex flex-col">
              <button 
                onClick={() => setIsFilmographyOpen(!isFilmographyOpen)}
                className="w-full text-left flex justify-between items-center p-4 flex-shrink-0"
                aria-expanded={isFilmographyOpen}
                aria-controls="filmography-content"
              >
                <h3 className="text-xl font-bold">Known For</h3>
                <ChevronUpIcon className={`w-6 h-6 transition-transform duration-300 ${isFilmographyOpen ? 'rotate-180' : ''}`} />
              </button>
              <div id="filmography-content" className="overflow-hidden flex-grow">
                 <div className="media-row overflow-x-auto p-4 pt-0">
                    <div className="flex space-x-4 pb-2">
                      {actor.filmography.map(item => (
                        <div key={item.id} className="flex-shrink-0 w-32 sm:w-36 md:w-40">
                          {/* FIX: The onSelect prop for RecommendationCard expects a function with no arguments. Wrap onSelectMedia in an arrow function to pass the specific 'item' and match the required `() => void` signature. */}
                          <RecommendationCard media={item} onSelect={() => onSelectMedia(item)} />
                        </div>
                      ))}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
