import React, { useEffect, useState } from 'react';
import type { MediaDetails, CollectionDetails, CastMember, UserLocation, WatchProviders } from '../types.ts';
import { CloseIcon, StarIcon, PlayIcon, ThumbsUpIcon, ThumbsDownIcon, TvIcon } from './icons.tsx';
import { RecommendationCard } from './RecommendationCard.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { CustomVideoPlayer } from './CustomVideoPlayer.tsx';
import { usePreferences } from '../hooks/usePreferences.ts';
import { Providers } from './Providers.tsx';
import { CinemaAvailability } from './CinemaAvailability.tsx';

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

const providersExist = (providers: WatchProviders) => {
    return (providers.flatrate && providers.flatrate.length > 0) ||
           (providers.rent && providers.rent.length > 0) ||
           (providers.buy && providers.buy.length > 0);
}

export const DetailModal: React.FC<DetailModalProps> = ({ item, onClose, isLoading, onSelectMedia, userLocation }) => {
    const [trailerVideoId, setTrailerVideoId] = useState<string | null>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const { likeItem, dislikeItem, unlistItem, isLiked, isDisliked } = usePreferences();
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (trailerVideoId) {
                    setTrailerVideoId(null);
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
    }, [onClose, trailerVideoId, item]);

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(event.currentTarget.scrollTop);
    };

    const handleWatchTrailer = () => {
        if (isMediaDetails(item) && item.trailerUrl) {
            const videoId = item.trailerUrl.split('embed/')[1]?.split('?')[0];
            if (videoId) {
                setTrailerVideoId(videoId);
            }
        }
    };
    
    const currentIsLiked = isMediaDetails(item) && isLiked(item.id);
    const currentIsDisliked = isMediaDetails(item) && isDisliked(item.id);

    const handleLike = () => {
        if (!isMediaDetails(item)) return;
        if (currentIsLiked) {
            unlistItem(item);
        } else {
            likeItem(item);
        }
    };
    
    const handleDislike = () => {
        if (!isMediaDetails(item)) return;
        if (currentIsDisliked) {
            unlistItem(item);
        } else {
            dislikeItem(item);
        }
    };

  const renderMediaContent = (media: MediaDetails) => (
    <>
        <div className="flex flex-wrap items-center gap-4 mb-6">
            {!isLoading && media.trailerUrl && (
                <button
                    onClick={handleWatchTrailer}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-semibold transition-colors duration-300"
                >
                    <PlayIcon className="w-6 h-6" />
                    <span>Watch Trailer</span>
                </button>
            )}
            <div className="flex items-center gap-2">
                <button
                    onClick={handleLike}
                    aria-label={currentIsLiked ? "Unlike" : "Like"}
                    className={`p-3 rounded-full border transition-colors duration-300 ${
                        currentIsLiked 
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20 hover:text-white'
                    }`}
                >
                    <ThumbsUpIcon className="w-6 h-6"/>
                </button>
                <button
                    onClick={handleDislike}
                    aria-label={currentIsDisliked ? "Remove dislike" : "Dislike"}
                    className={`p-3 rounded-full border transition-colors duration-300 ${
                        currentIsDisliked
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20 hover:text-white'
                    }`}
                >
                    <ThumbsDownIcon className="w-6 h-6"/>
                </button>
            </div>
        </div>
        
        {isLoading && !media.cast && <div className="mt-6 flex justify-center"><LoadingSpinner /></div>}

        {!isLoading && (
            <ModalSection title="Where to Watch">
                <div className="flex flex-col gap-4">
                    {media.isInTheaters && (
                        <CinemaAvailability userLocation={userLocation} movieTitle={media.title} />
                    )}

                    {media.watchProviders && providersExist(media.watchProviders) && (
                        <div>
                            <h4 className="text-md font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                <TvIcon className="w-5 h-5" />
                                <span>Streaming & On Demand</span>
                            </h4>
                            <Providers providers={media.watchProviders} />
                        </div>
                    )}
                    
                    {media.watchProviders?.link && (
                        <a 
                            href={`https://reelgood.com/search?q=${encodeURIComponent(media.title)}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block mt-2 px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-center w-full sm:w-auto"
                        >
                            Search all options on ReelGood
                        </a>
                    )}

                    {!media.isInTheaters && (!media.watchProviders || (!providersExist(media.watchProviders) && !media.watchProviders.link)) && (
                        <p className="text-gray-400 text-sm">
                            Viewing options could not be found for your region ({userLocation?.name}).
                        </p>
                    )}
                </div>
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
          className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 z-40 text-white/70 hover:text-white transition-colors bg-black/30 rounded-full p-1">
              <CloseIcon className="w-6 h-6"/>
          </button>
          
          {/* Header with backdrop and logo/title */}
          <header className="absolute top-0 left-0 right-0 h-56 sm:h-64 lg:h-80 z-10 overflow-hidden">
            <img 
              src={item.backdropUrl} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover" 
              style={{ transform: `translateY(${scrollTop * 0.5}px)` }}
            />
            <div 
              className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"
            ></div>
            <div 
              className="absolute inset-0 flex items-end justify-start p-6"
              style={{ 
                opacity: Math.max(0, 1 - scrollTop / 150),
                transform: `translateY(${scrollTop * 0.6}px)`
              }}
            >
              {isMediaDetails(item) && (
                isLoading ? (
                  <div className="w-full flex justify-center items-center h-full"><LoadingSpinner /></div>
                ) : item.logoUrl ? (
                  <img src={item.logoUrl} alt={`${item.title} logo`} className="max-w-[60%] sm:max-w-[50%] max-h-32 object-contain drop-shadow-2xl" />
                ) : (
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-left drop-shadow-2xl">{item.title}</h2>
                )
              )}
               {!isMediaDetails(item) && (
                 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-left drop-shadow-2xl">{item.name}</h2>
               )}
            </div>
          </header>

          <div 
            className="w-full h-full overflow-y-auto"
            style={{ scrollbarWidth: 'thin' }}
            onScroll={handleScroll}
          >
            {/* Spacer to push content below header */}
            <div className="h-56 sm:h-64 lg:h-80 flex-shrink-0" />
            
            {/* Main Content Area */}
            <div className="relative z-20 bg-gray-900 p-6">
                {isMediaDetails(item) && (
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mb-2 text-gray-300">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-5 h-5 text-yellow-400" />
                      <span className="font-bold text-lg">{item.rating}</span>
                      <span className="text-sm">/ 10</span>
                    </div>
                    <div className="uppercase text-sm px-2 py-0.5 border border-gray-500 rounded">
                        {item.type}
                    </div>
                     <div className="text-lg font-semibold">
                        {item.releaseYear}
                    </div>
                  </div>
                )}
                <p className="text-gray-300 text-sm sm:text-base">{item.overview}</p>

                <div className="mt-6">
                    {isMediaDetails(item) ? renderMediaContent(item) : renderCollectionContent(item)}
                </div>
            </div>
          </div>
        </div>
      </div>
      
      {trailerVideoId && (
        <CustomVideoPlayer 
          videoId={trailerVideoId}
          onClose={() => setTrailerVideoId(null)}
        />
      )}
    </>
  );
};