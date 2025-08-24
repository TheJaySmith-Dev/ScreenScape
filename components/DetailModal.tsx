import React, { useEffect, useState } from 'react';
import type { MediaDetails, CollectionDetails, CastMember, UserLocation } from '../types.ts';
import { CloseIcon, StarIcon, PlayIcon, TicketIcon } from './icons.tsx';
import { Providers } from './Providers.tsx';
import { RecommendationCard } from './RecommendationCard.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { getBookingInfo } from '../services/geminiService.ts';
import { VisionResult } from './VisionResult.tsx';

interface DetailModalProps {
  item: MediaDetails | CollectionDetails;
  onClose: () => void;
  isLoading: boolean;
  onSelectMedia: (media: MediaDetails) => void;
  userLocation: UserLocation | null;
}

const ModalSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-6">
      <h3 className="text-xl font-semibold text-gray-200 mb-3">{title}</h3>
      {children}
    </div>
);
  
const CastCard: React.FC<{ member: CastMember }> = ({ member }) => (
    <div className="flex-shrink-0 w-28 text-center">
      <img src={member.profileUrl} alt={member.name} className="w-24 h-24 object-cover rounded-full mx-auto mb-2 border-2 border-white/20" loading="lazy" />
      <p className="font-semibold text-sm text-white truncate">{member.name}</p>
      <p className="text-xs text-gray-400 truncate">{member.character}</p>
    </div>
);

// Type guard to differentiate between MediaDetails and CollectionDetails
const isMediaDetails = (item: MediaDetails | CollectionDetails): item is MediaDetails => {
  return 'title' in item && 'type' in item;
};

export const DetailModal: React.FC<DetailModalProps> = ({ item, onClose, isLoading, onSelectMedia, userLocation }) => {
    const [showTrailer, setShowTrailer] = useState(false);
    const [isVisionLoading, setIsVisionLoading] = useState(false);
    const [visionResult, setVisionResult] = useState<string | null>(null);
    const [visionError, setVisionError] = useState<string | null>(null);
    
    const trailerUrl = isMediaDetails(item) ? item.trailerUrl : null;

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

        // Reset vision state when item changes
        setIsVisionLoading(false);
        setVisionResult(null);
        setVisionError(null);

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'auto';
        };
    }, [onClose, showTrailer, item]);

    const handleFindShowtimes = async () => {
        if (!userLocation || !isMediaDetails(item)) return;

        setIsVisionLoading(true);
        setVisionResult(null);
        setVisionError(null);
        try {
            const result = await getBookingInfo(item.title, userLocation.name, userLocation.code);
            setVisionResult(result);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setVisionError(message);
        } finally {
            setIsVisionLoading(false);
        }
    }

  const renderTrailerOverlay = () => {
    if (!showTrailer || !trailerUrl) return null;

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
            src={`${trailerUrl}?autoplay=1`}
            title={`${isMediaDetails(item) ? item.title : ''} Trailer`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      </div>
    );
  };

  const renderWatchNowVision = () => {
      if (!isMediaDetails(item) || item.type !== 'movie' || !userLocation) return null;
      // Only show for movies released in the current year or last year.
      const currentYear = new Date().getFullYear();
      if (parseInt(item.releaseYear, 10) < currentYear - 1) return null;

      return (
          <ModalSection title="WatchNow Vision">
              <div className="bg-black/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-300 mb-4">See this movie in theaters? Let our AI assistant help you find tickets in {userLocation.name}.</p>
                  <button
                      onClick={handleFindShowtimes}
                      disabled={isVisionLoading}
                      className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-semibold transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <TicketIcon className="w-6 h-6" />
                      <span>{isVisionLoading ? 'Searching...' : 'Find Showtimes Nearby'}</span>
                  </button>

                  {isVisionLoading && <div className="mt-4"><LoadingSpinner/></div>}
                  {visionError && <p className="text-red-400 mt-4 text-sm">{visionError}</p>}
                  {visionResult && <VisionResult text={visionResult} />}
              </div>
          </ModalSection>
      )
  }

  const renderMediaContent = (media: MediaDetails) => (
    <>
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

        {renderWatchNowVision()}

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
              {media.related.map(rel => (
                <div key={rel.id} className="flex-shrink-0 w-32 sm:w-36 md:w-40">
                  <RecommendationCard media={rel} onSelect={() => { onClose(); onSelectMedia(rel); }} />
                </div>
              ))}
               <div className="flex-shrink-0 w-1"></div>
             </div>
          </ModalSection>
        )}
    </>
  );

  const renderCollectionContent = (collection: CollectionDetails) => (
    <>
        <h2 className="text-3xl font-bold mb-2">{collection.name}</h2>
        <p className="text-gray-300 mb-6">{collection.overview}</p>

        {isLoading && !collection.parts && <div className="mt-6 flex justify-center"><LoadingSpinner /></div>}

        {!isLoading && collection.parts && collection.parts.length > 0 && (
            <ModalSection title="Movies in this collection">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {collection.parts.map(part => (
                        <RecommendationCard key={part.id} media={part} onSelect={() => { onClose(); onSelectMedia(part); }} />
                    ))}
                </div>
            </ModalSection>
        )}
    </>
  );

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 fade-in"
        style={{ opacity: 0 }}
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900/50 border border-white/20 rounded-2xl overflow-hidden flex flex-col lg:flex-row backdrop-blur-lg"
          onClick={(e) => e.stopPropagation()}
        >
           <button onClick={onClose} className="absolute top-3 right-3 z-20 text-white/70 hover:text-white transition-colors">
              <CloseIcon className="w-8 h-8"/>
           </button>

          <div className="w-full lg:w-1/3 flex-shrink-0">
            {/* Mobile Header with Backdrop and Poster */}
            <div className="block lg:hidden relative">
              <img src={item.backdropUrl} alt="" className="w-full h-auto object-cover opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/70 to-transparent"></div>
              <div className="absolute bottom-4 left-4 w-24 sm:w-28">
                <img 
                  src={item.posterUrl} 
                  alt={isMediaDetails(item) ? item.title : item.name} 
                  className="rounded-lg shadow-lg w-full h-full object-cover" 
                  loading="lazy"
                />
              </div>
            </div>
            {/* Desktop Poster */}
            <div className="hidden lg:block w-full h-full">
              <img 
                src={item.posterUrl} 
                alt={isMediaDetails(item) ? item.title : item.name} 
                className="w-full h-full object-cover" 
                loading="lazy"
              />
            </div>
          </div>


          <div className="w-full lg:w-2/3 p-6 pt-0 lg:pt-6 flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {isMediaDetails(item) ? renderMediaContent(item) : renderCollectionContent(item)}
          </div>
        </div>
      </div>
      {renderTrailerOverlay()}
    </>
  );
};
