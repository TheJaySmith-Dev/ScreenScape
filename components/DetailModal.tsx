
import React, { useState, useEffect, useCallback } from 'react';
import type { MediaDetails, CollectionDetails, CastMember, CrewMember, UserLocation, WatchProviders, OmdbDetails, FunFact, SeasonDetails, Episode, SeasonSummary } from '../types.ts';
import { StarIcon, PlayIcon, ThumbsUpIcon, ThumbsDownIcon, TvIcon, SparklesIcon, InfoIcon, ChatBubbleIcon, CloseIcon } from './icons.tsx';
// FIX: Import `RecommendationGrid` which is used in this component, and remove the unused `RecommendationCard` import.
import { RecommendationGrid } from './RecommendationGrid.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { CustomVideoPlayer } from './CustomVideoPlayer.tsx';
import { usePreferences } from '../hooks/usePreferences.ts';
import { CinemaAvailability } from './CinemaAvailability.tsx';
import { fetchOmdbDetails } from '../services/omdbService.ts';
import { getFunFactsForMedia } from '../services/aiService.ts';
import { RateLimitMessage } from './RateLimitMessage.tsx';
import { useSettings } from '../hooks/useSettings.ts';
import { fetchSeasonDetails } from '../services/mediaService.ts';
import { useCountdown } from '../hooks/useCountdown.ts';
import { StreamingAvailability } from './StreamingAvailability.tsx';

interface DetailModalProps {
  item: MediaDetails | CollectionDetails;
  onClose: () => void;
  isLoading: boolean;
  onSelectMedia: (media: MediaDetails) => void;
  onSelectActor: (actorId: number) => void;
  userLocation: UserLocation | null;
  onOpenChat: (media: MediaDetails) => void;
}

const CountdownTimer: React.FC<{ airDate: string }> = ({ airDate }) => {
    const { days, hours, minutes, seconds, isFinished } = useCountdown(airDate);

    if (isFinished) return null;

    return (
        <div className="flex justify-center items-center gap-2 text-xs">
            <div className="flex flex-col items-center"><span className="font-bold">{String(days).padStart(2, '0')}</span><span className="opacity-70">d</span></div>
            <div className="flex flex-col items-center"><span className="font-bold">{String(hours).padStart(2, '0')}</span><span className="opacity-70">h</span></div>
            <div className="flex flex-col items-center"><span className="font-bold">{String(minutes).padStart(2, '0')}</span><span className="opacity-70">m</span></div>
            <div className="flex flex-col items-center"><span className="font-bold">{String(seconds).padStart(2, '0')}</span><span className="opacity-70">s</span></div>
        </div>
    );
};

const EpisodeCard: React.FC<{ episode: Episode; backdropUrl: string }> = ({ episode, backdropUrl }) => {
    const hasAired = episode.airDate ? new Date(episode.airDate) <= new Date() : true;
    const formattedAirDate = episode.airDate ? new Date(episode.airDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }) : 'TBA';
    const imageUrl = !hasAired ? backdropUrl : episode.stillUrl;

    return (
        <div className="glass-panel rounded-xl overflow-hidden flex flex-col md:flex-row gap-4 p-4">
            <div className="flex-shrink-0 w-full md:w-48 aspect-video relative">
                <img src={imageUrl} alt={episode.title} className="w-full h-full object-cover rounded-lg" loading="lazy" />
                {!hasAired && episode.airDate && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-2 rounded-lg">
                        <span className="text-sm font-semibold uppercase tracking-wider bg-indigo-500/80 px-2 py-0.5 rounded-md mb-2">Upcoming</span>
                        <CountdownTimer airDate={episode.airDate} />
                    </div>
                )}
            </div>
            <div className="flex-grow">
                <h5 className="font-semibold text-white truncate">
                    {`S${episode.seasonNumber}.E${episode.episodeNumber} - ${episode.title}`}
                </h5>
                <p className="text-xs text-gray-400 mb-2">{formattedAirDate}</p>
                <p className="text-sm text-gray-300 line-clamp-2 md:line-clamp-3 leading-snug">
                    {episode.overview || 'No overview available.'}
                </p>
            </div>
        </div>
    );
};

const EpisodeGuide: React.FC<{ tvShowId: number, seasonsData: SeasonSummary[], backdropUrl: string }> = ({ tvShowId, seasonsData, backdropUrl }) => {
    const regularSeasons = seasonsData.filter(s => s.season_number > 0).sort((a,b) => a.season_number - b.season_number);
    const [selectedSeason, setSelectedSeason] = useState<number>(regularSeasons.length > 0 ? regularSeasons[0].season_number : 1);
    const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const details = await fetchSeasonDetails(tvShowId, selectedSeason);
                setSeasonDetails(details);
            } catch (err) {
                setError("Could not load season details. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [tvShowId, selectedSeason]);
    
    if (regularSeasons.length === 0) {
        return <p className="text-gray-400">No season information available for this show.</p>;
    }
    
    return (
        <div>
            <div className="media-row overflow-x-auto pb-4 mb-4">
                <div className="flex space-x-2">
                    {regularSeasons.map(season => (
                        <button
                            key={season.id}
                            onClick={() => setSelectedSeason(season.season_number)}
                            className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                                selectedSeason === season.season_number ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'
                            }`}
                        >
                            Season {season.season_number}
                        </button>
                    ))}
                </div>
            </div>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-48"><LoadingSpinner /></div>
            ) : error ? (
                <p className="text-red-400 text-center">{error}</p>
            ) : (
                <div className="space-y-4">
                    {seasonDetails?.episodes.map(episode => <EpisodeCard key={episode.id} episode={episode} backdropUrl={backdropUrl} />)}
                </div>
            )}
        </div>
    );
};

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

const formatAiText = (text: string): { __html: string } => {
    // Sanitize and format basic markdown.
    const formattedContent = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
    return { __html: formattedContent };
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

const CrewMemberCard: React.FC<{ member: CrewMember; onSelect: (id: number) => void; }> = ({ member, onSelect }) => (
    <div className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors group" onClick={() => onSelect(member.id)}>
        <img src={member.profileUrl} alt={member.name} className="w-12 h-12 object-cover rounded-full border border-white/10" loading="lazy" />
        <div>
            <p className="font-semibold text-sm text-gray-200 group-hover:text-blue-400 transition-colors">{member.name}</p>
            <p className="text-xs text-gray-400">{member.job}</p>
        </div>
    </div>
);

// Type guard to differentiate between MediaDetails and CollectionDetails
const isMediaDetails = (item: MediaDetails | CollectionDetails): item is MediaDetails => {
  return 'title' in item && 'type' in item;
};

export const DetailModal: React.FC<DetailModalProps> = ({ item, onClose, isLoading, onSelectMedia, onSelectActor, userLocation, onOpenChat }) => {
    const [trailerVideoId, setTrailerVideoId] = useState<string | null>(null);
    const { likeItem, dislikeItem, unlistItem, isLiked, isDisliked } = usePreferences();
    const [omdbDetails, setOmdbDetails] = useState<OmdbDetails | null>(null);
    const [isOmdbLoading, setIsOmdbLoading] = useState(false);
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
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
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleEsc);
        document.querySelector('#root')?.scrollTo(0, 0); // Scroll page view to top on mount
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose, trailerVideoId]);

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
            const videoId = item.trailerUrl.split('embed/')[1];
            setTrailerVideoId(videoId);
        }
    };

    const handleLike = () => {
        if (isMediaDetails(item)) {
            isLiked(item.id) ? unlistItem(item) : likeItem(item);
        }
    };

    const handleDislike = () => {
        if (isMediaDetails(item)) {
            isDisliked(item.id) ? unlistItem(item) : dislikeItem(item);
        }
    };

    const handleGenerateFunFacts = useCallback(async () => {
        if (!aiClient || !isMediaDetails(item)) return;
        const { canRequest } = canMakeRequest();
        if (!canRequest) return;
        
        setIsFactsLoading(true);
        setFactsError(null);
        try {
            const facts = await getFunFactsForMedia(item.title, item.releaseYear, aiClient);
            incrementRequestCount();
            setFunFacts(facts);
        } catch (e: any) {
            setFactsError(e.message || "Could not generate fun facts.");
        } finally {
            setIsFactsLoading(false);
        }
    }, [aiClient, item, canMakeRequest, incrementRequestCount]);
    
    // Reset fun facts when item changes
    useEffect(() => {
        setFunFacts(null);
        setFactsError(null);
    }, [item.id]);

    const handleChatClick = () => {
        if (isMediaDetails(item)) {
            onOpenChat(item);
        }
    }

    const itemIsLiked = isMediaDetails(item) && isLiked(item.id);
    const itemIsDisliked = isMediaDetails(item) && isDisliked(item.id);

    const backgroundImageUrl = isMediaDetails(item)
        ? (item.textlessBackdropUrl || item.backdropUrl)
        : item.backdropUrl;
    
    const pageTitle = isMediaDetails(item) ? item.title : item.name;
    
    return (
      <div 
        className="w-full max-w-4xl glass-panel p-0 md:p-1 max-h-[90vh] flex flex-col fade-in-modal relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 glass-button !rounded-full z-20"
          aria-label="Close"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        {trailerVideoId && <CustomVideoPlayer videoId={trailerVideoId} onClose={() => setTrailerVideoId(null)} />}
        
        <div className="overflow-y-auto media-row rounded-[24px]">
          <div className="relative min-h-[400px] md:min-h-[500px] flex flex-col justify-end text-white rounded-t-[24px] overflow-hidden p-6 md:p-8">
            <img src={backgroundImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 hero-backdrop-animated" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="relative z-10">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center -top-20">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  <h1 className="text-4xl sm:text-5xl font-bold mb-4 drop-shadow-xl">{pageTitle}</h1>
                  {isMediaDetails(item) && (
                      <div className="flex items-center gap-4 text-gray-300 text-sm mb-6">
                           <div className="flex items-center gap-1.5">
                               <StarIcon className="w-4 h-4 text-yellow-400" />
                               <span>{item.rating > 0 ? item.rating.toFixed(1) : 'NR'}</span>
                           </div>
                           <span>•</span>
                           <span>{item.type === 'movie' ? item.releaseYear : getTvDateRange(item.releaseDate, item.lastAirDate, item.status)}</span>
                           <span>•</span>
                           <span>{item.rated || 'Not Rated'}</span>
                           <span>•</span>
                           <span>{item.type === 'movie' ? formatRuntime(item.runtime) : `${item.numberOfSeasons} Season${item.numberOfSeasons !== 1 ? 's' : ''}`}</span>
                      </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    {isMediaDetails(item) && item.trailerUrl && (
                      <button onClick={handleWatchTrailer} className="glass-button primary text-sm">
                        <PlayIcon className="w-5 h-5" />
                        <span>Trailer</span>
                      </button>
                    )}
                    <button onClick={() => setIsDetailsVisible(!isDetailsVisible)} className="glass-button text-sm">
                      <InfoIcon className="w-5 h-5"/>
                      <span>More Info</span>
                    </button>
                    {isMediaDetails(item) && (
                      <>
                        <button onClick={handleLike} className={`glass-button !p-3 transition-colors ${itemIsLiked ? 'bg-green-500/30 border-green-500/50' : ''}`} aria-label={itemIsLiked ? 'Unlike' : 'Like'}>
                            <ThumbsUpIcon className={`w-5 h-5 ${itemIsLiked ? 'text-green-300' : ''}`} />
                        </button>
                        <button onClick={handleDislike} className={`glass-button !p-3 transition-colors ${itemIsDisliked ? 'bg-red-500/30 border-red-500/50' : ''}`} aria-label={itemIsDisliked ? 'Undislike' : 'Dislike'}>
                            <ThumbsDownIcon className={`w-5 h-5 ${itemIsDisliked ? 'text-red-300' : ''}`} />
                        </button>
                        <button onClick={handleChatClick} className="glass-button !p-3" aria-label="Chat with AI">
                            <ChatBubbleIcon className="w-5 h-5"/>
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="p-6 md:p-8 bg-[#151517]">
             {isMediaDetails(item) && (
                <>
                  <p className="text-gray-300 leading-relaxed mb-8">{item.overview}</p>

                  <div className="flex flex-col md:flex-row gap-8">
                     <div className="md:w-2/3">
                        {item.cast && item.cast.length > 0 && (
                          <ModalSection title="Cast">
                             <div className="media-row overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                                <div className="flex space-x-4">
                                  {item.cast.map(member => <CastCard key={member.id} member={member} onSelect={onSelectActor} />)}
                                </div>
                            </div>
                          </ModalSection>
                        )}
                        {item.crew && item.crew.length > 0 && (
                            <ModalSection title="Key Crew">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {item.crew.map(member => (
                                        <CrewMemberCard key={member.id} member={member} onSelect={onSelectActor} />
                                    ))}
                                </div>
                            </ModalSection>
                        )}
                     </div>
                     <div className="md:w-1/3 flex-shrink-0 space-y-6">
                        {userLocation && item.isInTheaters && (
                            <CinemaAvailability userLocation={userLocation} movieTitle={item.title} />
                        )}
                        
                        {isMediaDetails(item) && !item.isInTheaters && <StreamingAvailability item={item} userLocation={userLocation} />}

                        {aiClient && (
                            <div>
                                <h4 className="text-md font-semibold text-white mb-2 flex items-center gap-2">
                                    <SparklesIcon className="w-5 h-5 text-indigo-400" /> AI Insights
                                </h4>
                                {canMakeRequest().canRequest ? (
                                    <button 
                                        onClick={handleGenerateFunFacts} 
                                        disabled={isFactsLoading}
                                        className="w-full text-center p-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                    >
                                        {isFactsLoading ? 'Generating...' : 'Generate Fun Facts'}
                                    </button>
                                ) : (
                                    <RateLimitMessage resetTime={canMakeRequest().resetTime!} featureName="Fun Facts" />
                                )}
                            </div>
                        )}
                     </div>
                  </div>
                  
                  {funFacts && (
                    <div className="mt-8 space-y-3">
                        {funFacts.map((fact, index) => (
                           <div key={index} className="fun-fact-card" style={{ borderLeftColor: `hsl(${index * 60 + 220}, 70%, 60%)` }}>
                             <p className="fun-fact-category" style={{ color: `hsl(${index * 60 + 220}, 70%, 70%)` }}>{fact.category}</p>
                             <p className="text-sm text-gray-300 mt-1" dangerouslySetInnerHTML={formatAiText(fact.fact)}></p>
                           </div>
                        ))}
                    </div>
                  )}
                  {factsError && <p className="text-red-400 mt-4">{factsError}</p>}
                  
                  {item.type === 'tv' && item.seasons && item.seasons.length > 0 && (
                    <ModalSection title="Episode Guide">
                       <EpisodeGuide tvShowId={item.id} seasonsData={item.seasons} backdropUrl={item.backdropUrl} />
                    </ModalSection>
                  )}
                </>
              )}
             
              {isMediaDetails(item) && item.related && item.related.length > 0 && (
                 <ModalSection title="You Might Also Like">
                    <RecommendationGrid recommendations={item.related} onSelect={onSelectMedia} />
                 </ModalSection>
              )}

              {'parts' in item && item.parts && item.parts.length > 0 && (
                <ModalSection title="Collection Contents">
                   <RecommendationGrid recommendations={item.parts} onSelect={onSelectMedia} />
                </ModalSection>
              )}
          </div>
        </div>
      </div>
    );
};