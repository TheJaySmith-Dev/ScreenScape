import React, { useState } from 'react';
import type { ActorDetails, MediaDetails } from '../types.ts';
import { RecommendationGrid } from './RecommendationGrid.tsx';
import { CakeIcon, LocationMarkerIcon } from './icons.tsx';

interface ActorPageProps {
  actor: ActorDetails;
  onBack: () => void;
  onSelectMedia: (media: MediaDetails) => void;
}

const ActorInfo: React.FC<{ icon: React.ReactNode; label: string; value: string | null }> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-500 mt-1">{icon}</div>
      <div>
        <p className="font-semibold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
};

export const ActorPage: React.FC<ActorPageProps> = ({ actor, onBack, onSelectMedia }) => {
  const [showFullBio, setShowFullBio] = useState(false);
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
    <div className="w-full max-w-7xl fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="px-4 py-2 text-sm bg-black/5 hover:bg-black/10 rounded-full transition-colors">&larr; Back</button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
          <img src={actor.profilePath} alt={actor.name} className="w-full rounded-2xl aspect-[2/3] object-cover" />
        </div>
        <div className="w-full">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{actor.name}</h1>
          <div className="flex flex-wrap gap-x-8 gap-y-4 mb-6">
            <ActorInfo icon={<CakeIcon className="w-5 h-5" />} label="Birthday" value={formatDate(actor.birthday)} />
            <ActorInfo icon={<LocationMarkerIcon className="w-5 h-5" />} label="Place of Birth" value={actor.placeOfBirth} />
          </div>
          
          <h2 className="text-xl font-semibold mb-2">Biography</h2>
          <p className="text-gray-600 leading-relaxed">
            {showFullBio ? actor.biography : truncatedBio}
          </p>
          {canTruncate && (
            <button onClick={() => setShowFullBio(!showFullBio)} className="text-blue-600 hover:text-blue-500 font-semibold mt-2">
              {showFullBio ? 'Read Less' : 'Read More'}
            </button>
          )}
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-6">Known For</h2>
      <RecommendationGrid recommendations={actor.filmography} onSelect={onSelectMedia} />
    </div>
  );
};