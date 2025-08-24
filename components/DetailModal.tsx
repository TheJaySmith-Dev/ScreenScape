import React, { useEffect, useState } from 'react';
import type { MediaDetails, CastMember } from '../types';
import { CloseIcon, StarIcon, PlayIcon } from './icons';
import { Providers } from './Providers';
import { RecommendationCard } from './RecommendationCard';
import { LoadingSpinner } from './LoadingSpinner';

interface DetailModalProps {
  media: MediaDetails;
  onClose: () => void;
  isLoading: boolean;
}

const ModalSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-6">
      <h3 className="text-xl font-semibold text-gray-200 mb-3">{title}</h3>
      {children}
    </div>
);
  
const CastCard: React.FC<{ member: CastMember }> = ({ member }) => (
    <div className="flex-shrink-0 w-28 text-center">
      <img src={member.profileUrl} alt={member.name} className="w-24 h-24 object-cover rounded-full mx-auto mb-2 border-2 border-white/20" />
      <p className="font-semibold text-sm text-white truncate">{member.name}</p>
      <p className="text-xs text-gray-400 truncate">{member.character}</p>
    </div>
);

export const DetailModal: React.FC<DetailModalProps> = ({ media, onClose, isLoading }) => {
    const [showTrailer, setShowTrailer] = useState(false);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (showTrailer) {
                    setShowTrailer(false);
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'auto';
        };
    }, [onClose, showTrailer]);

  const renderTrailerOverlay = () => {
    if (!showTrailer || !media.trailerUrl) return null;

    return (
      <div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 fade-in"
        onClick={() => setShowTrailer(false)}
      >
        <div
          className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowTrailer(false)}
            className="absolute top-2 right-2 z-10 text-white/70 hover:text-white transition-colors"
            aria-label="Close trailer"
          >
            <CloseIcon className="w-8 h-8" />
          </button>
          <iframe
            src={`${media.trailerUrl}?autoplay=1`}
            title={`${media.title} Trailer`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      </div>
    );
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 fade-in"
        style={{ opacity: 0 }}
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900/50 border border-white/20 rounded-2xl overflow-hidden flex flex-col md:flex-row backdrop-blur-lg"
          onClick={(e) => e.stopPropagation()}
        >
           <button onClick={onClose} className="absolute top-3 right-3 z-20 text-white/70 hover:text-white transition-colors">
              <CloseIcon className="w-8 h-8"/>
           </button>

          <div className="w-full md:w-1/3 flex-shrink-0 hidden md:block">
            <img src={media.posterUrl} alt={media.title} className="w-full h-full object-cover"/>
          </div>

          <div className="w-full md:w-2/3 p-6 flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            <h2 className="text-3xl font-bold mb-2">{media.title} <span className="text-gray-400 font-normal">({media.releaseYear})</span></h2>
            
            <div className="flex items-center gap-4 mb-4 text-gray-300">
              <div className="flex items-center gap-1">
                <StarIcon className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-lg">{media.rating}</span>
                <span className="text-sm">/ 10</span>
              </div>
              <div className="uppercase text-sm px-2 py-0.5 border border-gray-500 rounded">
                  {media.type}
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">{media.overview}</p>
            
            {!isLoading && media.trailerUrl && (
              <div className="mb-6">
                <button
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-semibold transition-colors duration-300"
                >
                    <PlayIcon className="w-6 h-6" />
                    <span>Watch Trailer</span>
                </button>
              </div>
            )}
            
            {isLoading && !media.cast && <div className="mt-6 flex justify-center"><LoadingSpinner /></div>}

            {!isLoading && media.watchProviders && (Object.values(media.watchProviders).some(v => v && v.length > 0)) && (
              <ModalSection title="Where to Watch">
                <Providers providers={media.watchProviders} />
              </ModalSection>
            )}

            {!isLoading && media.cast && media.cast.length > 0 && (
              <ModalSection title="Top Billed Cast">
                <div className="media-row flex overflow-x-auto space-x-4 -mx-6 px-6 pb-2">
                  {media.cast.map(member => (
                    <CastCard key={member.name + member.character} member={member} />
                  ))}
                  <div className="flex-shrink-0 w-1"></div>
                </div>
              </ModalSection>
            )}
            
            {!isLoading && media.related && media.related.length > 0 && (
              <ModalSection title="You Might Also Like">
                 <div className="media-row flex overflow-x-auto space-x-4 -mx-6 px-6 pb-2">
                  {media.related.map(item => (
                    <div key={item.id} className="flex-shrink-0 w-32 sm:w-36 md:w-40">
                      <RecommendationCard media={item} onSelect={() => { onClose(); }} />
                    </div>
                  ))}
                   <div className="flex-shrink-0 w-1"></div>
                 </div>
              </ModalSection>
            )}

          </div>
        </div>
      </div>
      {renderTrailerOverlay()}
    </>
  );
};