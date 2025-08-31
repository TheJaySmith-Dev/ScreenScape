


import React, { useEffect, useState } from 'react';
import type { MediaDetails, CollectionDetails, CastMember, UserLocation, WatchProviders } from '../types.ts';
import { StarIcon, PlayIcon, ThumbsUpIcon, ThumbsDownIcon, TvIcon } from './icons.tsx';
import { RecommendationCard } from './RecommendationCard.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { CustomVideoPlayer } from './CustomVideoPlayer.tsx';
import { usePreferences } from '../hooks/usePreferences.ts';
import { Providers } from './Providers.tsx';
import { CinemaAvailability } from './CinemaAvailability.tsx';
import { ExternalRatings } from './ExternalRatings.tsx';

interface DetailModalProps {
  item: MediaDetails | CollectionDetails;
  onClose: () => void;
  isLoading: boolean;
  onSelectMedia: (media: MediaDetails) => void;
  onSelectActor: (actorId: number) => void;
  userLocation: UserLocation | null;
  // FIX: Changed onPlayTrailer signature to accept a MediaDetails object for consistency.
  onPlayTrailer: (media: MediaDetails) => void;
}

const formatRuntime = (minutes: number | undefined): string => {
    if (minutes === undefined || minutes === null || minutes <= 0) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (mins > 0) result += `${mins}m`;
    return result.trim();
};

const getTvDateRange = (firstAirDate: string | undefined, lastAirDate: string | undefined, status: string | undefined): string => {
    if (!firstAirDate) return '';
    const startYear = firstAirDate.substring(0, 4);
    if (status === 'Ended' && lastAirDate) {
        const endYear = lastAirDate.substring(0, 4);
        if (startYear === endYear) return startYear;
        return `${startYear} – ${endYear}`;
    }
    if (startYear) return `${startYear} –`;
    return '';
};


const ModalSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-gray-200 mb-4">{title}</h3>
      {children}
    </div>
);
  
const CastCard: React.FC<{ member: CastMember; onSelect: (id: number) => void; }> = ({ member, onSelect }) => (
    <div className="flex-shrink-0 w-28 text-center cursor-pointer group" onClick={() => onSelect(member.id)}>
      <img src={member.profileUrl} alt={member.name} className="w-24 h-24 object-cover rounded-full mx-auto mb-2 border-2 border-white/20 group-hover:border-white/40 transition-colors" loading="lazy" />
      <p className="font-semibold text-sm text-white truncate group-hover:text-blue-300 transition-colors">{member.name}</p>
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

export const DetailModal: React.FC<DetailModalProps> = ({ item, onClose, isLoading, onSelectMedia, onSelectActor, userLocation, onPlayTrailer }) => {
    const { likeItem, dislikeItem, unlistItem, isLiked, isDisliked } = usePreferences();
    
    // Effect for keyboard shortcuts and scrolling to top
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        document.querySelector('#root')?.scrollTo(0, 0); // Scroll page view to top on mount
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleWatchTrailer = () => {
        if (isMediaDetails(item)) {
            onPlayTrailer(item);
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
                <CastCard key={member.id} member={member} onSelect={onSelectActor} />
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
                  {/* FIX: Added onPlayTrailer prop. */}
                  <RecommendationCard media={rel} onSelect={() => onSelectMedia(rel)} onPlayTrailer={() => onPlayTrailer(rel)} />
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
                        // FIX: Added onPlayTrailer prop.
                        <RecommendationCard key={part.id} media={part} onSelect={() => onSelectMedia(part)} onPlayTrailer={() => onPlayTrailer(part)} />
                    ))}
                </div>
            </ModalSection>
        )}
    </>
  );

  const isMedia = isMediaDetails(item);
  const posterUrl = isMedia ? (item.textlessPosterUrl || item.posterUrl) : item.posterUrl;
  const backdropUrl = isMedia ? item.backdropUrl : item.backdropUrl;

  return (
    <>
      <div className="w-full max-w-6xl mx-auto fade-in" style={{ opacity: 0 }}>
        <div className="my-6">
            <button onClick={onClose} className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors">&larr; Back</button>
        </div>

        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden mb-8 bg-gray-800 min-h-[400px] md:min-h-[450px] flex items-center">
            <div className="absolute inset-0">
                <img src={backdropUrl} alt="" className="w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
            </div>

            <div className="relative p-6 md:p-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 w-full">
                <img src={posterUrl} alt={isMedia ? item.title : item.name} className="w-40 md:w-52 rounded-lg shadow-2xl aspect-[2/3] object-cover flex-shrink-0" />
                <div className="flex-grow text-center md:text-left">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-2xl mb-4">
                        {isMediaDetails(item) ? item.title : item.name}
                    </h2>

                    {isMediaDetails(item) && (
                    <>
                        <div className="flex items-center justify-center md:justify-start flex-wrap gap-x-4 gap-y-1 mb-4 text-gray-300">
                            <div className="text-lg font-semibold">
                                {item.type === 'movie' ? item.releaseYear : getTvDateRange(item.releaseDate, item.lastAirDate, item.status) || item.releaseYear}
                            </div>
                            {item.type === 'movie' && item.runtime && item.runtime > 0 && (
                                <div className="font-semibold text-lg">
                                    {formatRuntime(item.runtime)}
                                </div>
                            )}
                            {item.type === 'tv' && item.numberOfSeasons && (
                                <div className="font-semibold text-lg">
                                    {`${item.numberOfSeasons} Season${item.numberOfSeasons > 1 ? 's' : ''}`}
                                </div>
                            )}
                            {item.rated && (
                                <div className="uppercase text-sm px-2 py-0.5 border border-gray-500 rounded">
                                    {item.rated}
                                </div>
                            )}
                            <div className="uppercase text-sm px-2 py-0.5 border border-gray-500 rounded">
                                {item.type}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-start justify-center md:justify-start gap-3 mb-4">
                            <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
                                <StarIcon className="w-8 h-8 text-yellow-400" />
                                <div>
                                    <span className="font-bold text-lg">{item.rating}</span>
                                    <span className="text-sm">/10</span>
                                    <p className="text-xs text-gray-400 -mt-1">TMDb</p>
                                </div>
                            </div>
                            {!isLoading && <ExternalRatings ratings={item.otherRatings} />}
                        </div>
                        
                        {!isLoading && item.awards && item.awards !== 'N/A' && (
                        <div className="mb-4 p-3 bg-yellow-900/30 border-l-4 border-yellow-500 rounded-r-lg">
                            <p className="text-sm text-yellow-300 font-semibold">🏆 {item.awards}</p>
                        </div>
                        )}
                    </>
                    )}
                </div>
            </div>
        </div>
        
        {/* Main Content Below Hero */}
        <div className="px-4 md:px-10 pb-12">
            <p className="text-gray-300 text-sm sm:text-base mb-6">{item.overview}</p>
            {isMediaDetails(item) ? renderMediaContent(item) : renderCollectionContent(item)}
        </div>
      </div>
    </>
  );
};