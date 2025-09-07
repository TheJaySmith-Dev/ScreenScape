

import React, { useState, useEffect } from 'react';
import type { MediaDetails, CollectionDetails, CastMember, UserLocation, WatchProviders, OmdbDetails, FunFact } from '../types.ts';
import { StarIcon, PlayIcon, ThumbsUpIcon, ThumbsDownIcon, TvIcon, HomeIcon, SparklesIcon, InfoIcon, ChatBubbleIcon } from './icons.tsx';
import { RecommendationCard } from './RecommendationCard.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { CustomVideoPlayer } from './CustomVideoPlayer.tsx';
import { usePreferences } from '../hooks/usePreferences.ts';
import { Providers } from './Providers.tsx';
import { CinemaAvailability } from './CinemaAvailability.tsx';
import { fetchOmdbDetails } from '../services/omdbService.ts';
import { getFunFactsForMedia } from '../services/aiService.ts';
import { RateLimitMessage } from './RateLimitMessage.tsx';
import { ChatModal } from './ChatModal.tsx';
import { useSettings } from '../hooks/useSettings.ts';

interface DetailModalProps {
  item: MediaDetails | CollectionDetails;
  onClose: () => void;
  isLoading: boolean;
  onSelectMedia: (media: MediaDetails) => void;
  onSelectActor: (actorId: number) => void;
  userLocation: UserLocation | null;
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
    <div className="mt-12">
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
);
  
const CastCard: React.FC<{ member: CastMember; onSelect: (id: number) => void; }> = ({ member, onSelect }) => (
    <div className="flex-shrink-0 w-28 text-center cursor-pointer group" onClick={() => onSelect(member.id)}>
      <div className="relative w-24 h-24 mx-auto mb-2">
        <img src={member.profileUrl} alt={member.name} className="w-full h-full object-cover rounded-full border-2 border-white/10 transition-transform duration-300 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-blue-500/50 transition-colors duration-300 group-hover:shadow-[0_0_15px_rgba(67,56,202,0.4)]"></div>
      </div>
      <p className="font-semibold text-sm text-gray-200 truncate group-hover:text-blue-400 transition-colors">{member.name}</p>
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

export const DetailModal: React.FC<DetailModalProps> = ({ item, onClose, isLoading, onSelectMedia, onSelectActor, userLocation }) => {
    const [trailerVideoId, setTrailerVideoId] = useState<string | null>(null);
    const { likeItem, dislikeItem, unlistItem, isLiked, isDisliked } = usePreferences();
    const [omdbDetails, setOmdbDetails] = useState<OmdbDetails | null>(null);
    const [isOmdbLoading, setIsOmdbLoading] = useState(false);
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const { aiClient, canMakeRequest, incrementRequestCount } = useSettings();

    // State for AI-generated Fun Facts
    const [funFacts, setFunFacts] = useState<FunFact[] | null>(null);
    const [isFactsLoading, setIsFactsLoading] = useState(false);
    const [factsError, setFactsError] = useState<string | null>(null);

    // Effect for keyboard shortcuts and scrolling to top
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (trailerVideoId) {
                    setTrailerVideoId(null);
                } else if (isChatModalOpen) {
                    setIsChatModalOpen(false);
                }
                 else {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleEsc);
        document.querySelector('#root')?.scrollTo(0, 0); // Scroll page view to top on mount
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose, trailerVideoId, isChatModalOpen]);

    // Effect to fetch OMDb data
    useEffect(() => {
        setOmdbDetails(null); // Reset on item change
        if (isMediaDetails(item) && item.imdbId) {
            const fetchDetails = async () => {
                setIsOmdbLoading(true);
                try {
                    const details = await fetchOmdbDetails(item.imdbId);
                    if(details) {
                        setOmdbDetails(details);
                    }
                } catch (e) {
                    console.error("Failed to fetch OMDb details", e);
                } finally {
                    setIsOmdbLoading(false);
                }
            };
            fetchDetails();
        }
    }, [item.id, item]);

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

    const handleGenerateFacts = async () => {
        if (!isMediaDetails(item) || !aiClient) return;

        const { canRequest } = canMakeRequest();
        if (!canRequest) {
            // The UI will update automatically from the context, but we prevent the request.
            return;
        }

        setIsFactsLoading(true);
        setFactsError(null);
        setFunFacts(null);
        try {
            const facts = await getFunFactsForMedia(item.title, item.releaseYear, aiClient);
            incrementRequestCount();
            setFunFacts(facts);
        } catch (e: any) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred generating facts.";
            setFactsError(errorMessage);
        } finally {
            setIsFactsLoading(false);
        }
    };

    const FunFactsSection: React.FC = () => {
        if (isFactsLoading) {
            return (
                <div className="flex items-center justify-center h-24">
                    <LoadingSpinner />
                </div>
            );
        }
    
        if (factsError) {
            return <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{factsError}</p>;
        }

        if (!funFacts) return null;

        if (funFacts.length === 0) {
            return <p className="text-gray-400 text-sm">No interesting facts could be generated for this title.</p>;
        }
        
        const categoryColors: { [key: string]: { border: string; text: string } } = {
            'Casting': { border: 'border-blue-400', text: 'text-blue-300' },
            'Production': { border: 'border-purple-400', text: 'text-purple-300' },
            'Trivia': { border: 'border-green-400', text: 'text-green-300' },
            'Legacy': { border: 'border-yellow-400', text: 'text-yellow-300' },
            'default': { border: 'border-gray-400', text: 'text-gray-300' },
        };

        return (
            <div className="space-y-4 mt-6">
                {funFacts.map((fact, index) => {
                    const color = categoryColors[fact.category] || categoryColors.default;
                    return (
                        <div key={index} className={`fun-fact-card ${color.border}`}>
                            <p className={`fun-fact-category mb-1 ${color.text}`}>{fact.category}</p>
                            <p className="text-gray-200">{fact.fact}</p>
                        </div>
                    );
                })}
            </div>
        );
    };

    const OmdbDetailsSection: React.FC = () => {
        const { canRequest: canMakeAiRequest, resetTime } = canMakeRequest();

        if (isOmdbLoading) {
            return (
                <div className="flex items-center justify-center h-24">
                    <LoadingSpinner />
                </div>
            );
        }
    
        if (!omdbDetails) {
            return <p className="text-gray-400 text-sm">Additional details could not be loaded.</p>;
        }
        
        const detailItems = [
            { label: 'Director(s)', value: omdbDetails.Director },
            { label: 'Writer(s)', value: omdbDetails.Writer },
            { label: 'Awards', value: omdbDetails.Awards },
            { label: 'Box Office', value: omdbDetails.BoxOffice },
            { label: 'Production', value: omdbDetails.Production },
        ];
    
        return (
            <div className="fun-facts-container fade-in">
                 {omdbDetails.Plot && omdbDetails.Plot !== 'N/A' && item.overview !== omdbDetails.Plot && (
                    <div className="mb-6">
                        <p className="text-gray-200 leading-relaxed">{omdbDetails.Plot}</p>
                    </div>
                 )}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {detailItems.filter(i => i.value && i.value !== 'N/A').map(item => (
                        <div key={item.label}>
                            <p className="text-sm font-semibold text-gray-400">{item.label}</p>
                            <p className="text-gray-200">{item.value}</p>
                        </div>
                    ))}
                 </div>

                 <div className="mt-6 pt-6 border-t border-white/10">
                    { !funFacts && !isFactsLoading && !factsError && (
                        !canMakeAiRequest && resetTime ? (
                            <RateLimitMessage resetTime={resetTime} featureName="AI Facts" />
                        ) : (
                         <button
                            onClick={handleGenerateFacts}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-xl text-white font-semibold transition-all duration-300"
                            disabled={!aiClient}
                         >
                            <SparklesIcon className="w-6 h-6 text-indigo-400" />
                            <span>Generate Behind-the-Scenes Facts</span>
                         </button>
                        )
                    )}
                    <FunFactsSection />
                 </div>
            </div>
        );
    };

  const renderMediaContent = (media: MediaDetails) => (
    <>
        <div className="flex flex-wrap items-center gap-4 mb-6">
            {!isLoading && media.trailerUrl && (
                <button
                    onClick={handleWatchTrailer}
                    className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 glass-panel rounded-xl text-white font-semibold transition-all duration-300 hover:bg-white/5 hover:scale-105 text-sm sm:text-base"
                >
                    <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Trailer</span>
                </button>
            )}
            {!isLoading && media.imdbId && (
                <button
                    onClick={() => setIsDetailsVisible(prev => !prev)}
                    className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 glass-panel rounded-xl text-white font-semibold transition-all duration-300 hover:bg-white/5 hover:scale-105 text-sm sm:text-base"
                >
                    <InfoIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="hidden sm:inline">{isDetailsVisible ? 'Hide Info' : 'More Info'}</span>
                    <span className="sm:hidden">Info</span>
                </button>
            )}
             <button
                onClick={() => setIsChatModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 glass-panel rounded-xl text-white font-semibold transition-all duration-300 hover:bg-white/5 hover:scale-105 text-sm sm:text-base"
                disabled={!aiClient}
            >
                <ChatBubbleIcon className="w-5 h-5 sm:w-6 sm-h-6" />
                <span>Ask ScapeAI</span>
            </button>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleLike}
                    aria-label={currentIsLiked ? "Unlike" : "Like"}
                    className={`p-2 sm:p-3 glass-panel rounded-full transition-all duration-300 hover:scale-110 ${
                        currentIsLiked 
                        ? 'bg-green-500/20 !border-green-500 text-green-400'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <ThumbsUpIcon className="w-5 h-5 sm:w-6 sm:h-6"/>
                </button>
                <button
                    onClick={handleDislike}
                    aria-label={currentIsDisliked ? "Remove dislike" : "Dislike"}
                    className={`p-2 sm:p-3 glass-panel rounded-full transition-all duration-300 hover:scale-110 ${
                        currentIsDisliked
                        ? 'bg-red-500/20 !border-red-500 text-red-400'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <ThumbsDownIcon className="w-5 h-5 sm:w-6 sm:h-6"/>
                </button>
            </div>
        </div>
        
        {isLoading && !media.cast && <div className="mt-6 flex justify-center"><LoadingSpinner /></div>}

        {isDetailsVisible && (
            <ModalSection title="More Details & Synopsis">
                <OmdbDetailsSection />
            </ModalSection>
        )}

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
                            className="inline-block mt-2 px-4 py-2 text-sm glass-panel rounded-lg transition-colors text-center w-full sm:w-auto hover:bg-white/5"
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
                  <RecommendationCard media={rel} onSelect={() => onSelectMedia(rel)} />
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
                        <RecommendationCard key={part.id} media={part} onSelect={() => onSelectMedia(part)} />
                    ))}
                </div>
            </ModalSection>
        )}
    </>
  );

  const isMedia = isMediaDetails(item);
  const backgroundImageUrl = isMedia ? (item.textlessPosterUrl || item.posterUrl) : item.backdropUrl;
  const mainPosterUrl = item.posterUrl;

  return (
    <>
      <div className="w-full max-w-6xl mx-auto fade-in">
        <div className="my-8 sm:my-12 flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-200 glass-panel rounded-full hover:bg-white/5 transition-colors">&larr; Back</button>
            <a href="#/home" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 glass-panel rounded-full hover:bg-white/5 transition-colors">
                <HomeIcon className="w-4 h-4" />
                <span>Home</span>
            </a>
        </div>

        {/* Hero Section */}
        <div className="relative glass-panel rounded-[28px] overflow-hidden mb-8 min-h-[380px] md:min-h-[450px] flex items-end">
            <div className="absolute inset-0">
                <img src={backgroundImageUrl} alt="" className="w-full h-full object-cover opacity-10 blur-2xl scale-125" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/10 to-transparent" />
                 <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
            </div>

            <div className="relative p-6 md:p-12 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-12 w-full">
                <img src={mainPosterUrl} alt={isMedia ? item.title : item.name} className="w-36 sm:w-48 md:w-60 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] aspect-[2/3] object-cover flex-shrink-0" />
                <div className="flex-grow text-center md:text-left">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.7)] mb-4">
                        {isMediaDetails(item) ? item.title : item.name}
                    </h2>

                    {isMediaDetails(item) && (
                    <>
                        <div className="flex items-center justify-center md:justify-start flex-wrap gap-x-4 gap-y-2 mb-4 text-gray-300 font-medium text-sm sm:text-base">
                            <div>
                                {item.type === 'movie' ? item.releaseYear : getTvDateRange(item.releaseDate, item.lastAirDate, item.status) || item.releaseYear}
                            </div>
                            {item.type === 'movie' && item.runtime && item.runtime > 0 && (
                                <>
                                <span className="text-gray-500">&bull;</span>
                                <div>{formatRuntime(item.runtime)}</div>
                                </>
                            )}
                            {item.type === 'tv' && item.numberOfSeasons && (
                                <>
                                <span className="text-gray-500">&bull;</span>
                                <div>{`${item.numberOfSeasons} Season${item.numberOfSeasons > 1 ? 's' : ''}`}</div>
                                </>
                            )}
                            {item.rated && (
                                <>
                                <span className="text-gray-500">&bull;</span>
                                <div className="uppercase text-xs sm:text-sm px-2 py-0.5 border border-gray-500 rounded-md">
                                    {item.rated}
                                </div>
                                </>
                            )}
                        </div>

                        <div className="flex flex-wrap items-start justify-center md:justify-start gap-3 mb-4">
                            <div className="flex items-center gap-2 glass-panel p-2 rounded-xl">
                                <StarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                                <div>
                                    <span className="font-bold text-base sm:text-lg text-white">{item.rating}</span>
                                    <span className="text-sm text-white">/10</span>
                                    <p className="text-xs text-gray-400 -mt-1">TMDb</p>
                                </div>
                            </div>
                        </div>
                    </>
                    )}
                </div>
            </div>
        </div>
        
        {/* Main Content Below Hero */}
        <div className="px-2 sm:px-6 md:px-12 pb-16">
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">{item.overview}</p>
            {isMediaDetails(item) ? renderMediaContent(item) : renderCollectionContent(item)}
        </div>
      </div>
      
      {trailerVideoId && (
        <CustomVideoPlayer 
          videoId={trailerVideoId}
          onClose={() => setTrailerVideoId(null)}
        />
      )}
      {isMediaDetails(item) && (
        <ChatModal 
            isOpen={isChatModalOpen}
            onClose={() => setIsChatModalOpen(false)}
            media={item}
        />
      )}
    </>
  );
};
