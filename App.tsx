// FIX: Correctly import React hooks (useState, useEffect, useCallback) to resolve 'Cannot find name' errors.
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { HeroSection } from './components/HeroSection.tsx';
import { MediaRow } from './components/MediaRow.tsx';
import { DetailModal } from './components/DetailModal.tsx';
import { LoadingSpinner } from './components/LoadingSpinner.tsx';
import { ActorPage } from './components/ActorPage.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';
import { AiSearchModal } from './components/AiSearchModal.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { ViewingGuideModal } from './components/ViewingGuideModal.tsx';
import { BrowseMenuModal } from './components/MobileMenuModal.tsx';
import { ChatModal } from './components/ChatModal.tsx';
import { AiDescriptionModal } from './components/AiDescriptionModal.tsx';
import { ReminderModal } from './components/ReminderModal.tsx';
import { SearchIcon, GridIcon, ThumbsUpIcon, HomeIcon, UserIcon } from './components/icons.tsx';

import * as mediaService from './services/mediaService.ts';
import { popularStudios } from './services/studioService.ts';
import { brands } from './services/brandService.ts';
import { supportedProviders } from './services/streamingService.ts';
import { popularNetworks } from './services/networkService.ts';
import { people } from './services/peopleService.ts';

import type { MediaDetails, CollectionDetails, Collection, ActorDetails, Brand, Person, Studio, Network, StreamingProviderInfo, UserLocation, ViewingGuide, MediaTypeFilter, SortBy, AiCuratedCarousel } from './types.ts';
import { getViewingGuidesForBrand, getAiDescriptionForBrand } from './services/aiService.ts';
import { useSettings } from './hooks/useSettings.ts';
import { useTmdbAccount } from './hooks/useTmdbAccount.ts';

// Lazy load page components for code-splitting and performance
const MyScapePage = React.lazy(() => import('./components/MyScapePage.tsx').then(module => ({ default: module.MyScapePage })));
const StudioGrid = React.lazy(() => import('./components/StudioGrid.tsx').then(module => ({ default: module.StudioGrid })));
const BrandGrid = React.lazy(() => import('./components/BrandGrid.tsx').then(module => ({ default: module.BrandGrid })));
const NetworkGrid = React.lazy(() => import('./components/NetworkGrid.tsx').then(module => ({ default: module.NetworkGrid })));
const PersonGrid = React.lazy(() => import('./components/PersonGrid.tsx').then(module => ({ default: module.PersonGrid })));
const PersonPage = React.lazy(() => import('./components/PersonPage.tsx').then(module => ({ default: module.PersonPage })));
const StreamingGrid = React.lazy(() => import('./components/StreamingGrid.tsx').then(module => ({ default: module.StreamingGrid })));
const BrandDetail = React.lazy(() => import('./components/BrandDetail.tsx').then(module => ({ default: module.BrandDetail })));
const RecommendationGrid = React.lazy(() => import('./components/RecommendationGrid.tsx').then(module => ({ default: module.RecommendationGrid })));
const ComingSoonPage = React.lazy(() => import('./components/ComingSoonPage.tsx').then(module => ({ default: module.ComingSoonPage })));
const TmdbCallbackPage = React.lazy(() => import('./pages/Callback/TmdbCallback.tsx').then(module => ({ default: module.TmdbCallbackPage })));

const getPathRoute = () => window.location.pathname.replace(/^\/?|\/$/g, '').split('/');

const App: React.FC = () => {
    const { tmdbApiKey, geminiApiKey, saveApiKeys, isInitialized, aiClient, isAllClearMode, canMakeRequest, incrementRequestCount, tmdb } = useSettings();
    const { watchlist, isLoading: isAccountLoading } = useTmdbAccount();
    const [route, setRoute] = useState<string[]>(getPathRoute());
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    
    // Page-specific data
    const [trending, setTrending] = useState<MediaDetails[]>([]);
    const [popularMovies, setPopularMovies] = useState<MediaDetails[]>([]);
    const [popularTv, setPopularTv] = useState<MediaDetails[]>([]);
    const [nowPlaying, setNowPlaying] = useState<MediaDetails[]>([]);
    const [searchResults, setSearchResults] = useState<MediaDetails[]>([]);
    const [studioContent, setStudioContent] = useState<MediaDetails[]>([]);
    const [brandContent, setBrandContent] = useState<MediaDetails[]>([]);
    const [networkContent, setNetworkContent] = useState<MediaDetails[]>([]);
    const [personContent, setPersonContent] = useState<MediaDetails[]>([]);
    const [streamingContent, setStreamingContent] = useState<MediaDetails[]>([]);
    const [moviesContent, setMoviesContent] = useState<MediaDetails[]>([]);
    const [tvContent, setTvContent] = useState<MediaDetails[]>([]);
    const [comingSoonContent, setComingSoonContent] = useState<MediaDetails[]>([]);
    const [curatedRows, setCuratedRows] = useState<AiCuratedCarousel[]>([]);
    const [isForYouLoading, setIsForYouLoading] = useState(false);
    const [forYouError, setForYouError] = useState<string | null>(null);

    // Modal/Detail states
    const [selectedItem, setSelectedItem] = useState<MediaDetails | CollectionDetails | null>(null);
    const [selectedActor, setSelectedActor] = useState<ActorDetails | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isAiSearchOpen, setIsAiSearchOpen] = useState(false);
    const [isViewingGuideModalOpen, setIsViewingGuideModalOpen] = useState(false);
    const [isBrowseMenuOpen, setIsBrowseMenuOpen] = useState(false);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [chatMediaItem, setChatMediaItem] = useState<MediaDetails | null>(null);
    const [chatBrandItem, setChatBrandItem] = useState<Brand | null>(null);
    const [brandGuides, setBrandGuides] = useState<ViewingGuide[]>([]);
    const [isGuideLoading, setIsGuideLoading] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<UserLocation>({ name: 'United States', code: 'US' });
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [mediaForReminder, setMediaForReminder] = useState<MediaDetails | null>(null);
    
    // AI Description Modal state
    const [isAiDescriptionModalOpen, setIsAiDescriptionModalOpen] = useState(false);
    const [selectedBrandForDescription, setSelectedBrandForDescription] = useState<Brand | null>(null);
    const [aiDescription, setAiDescription] = useState<string | null>(null);
    const [isAiDescriptionLoading, setIsAiDescriptionLoading] = useState(false);
    const [aiDescriptionError, setAiDescriptionError] = useState<string | null>(null);

    // Filter states
    const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaTypeFilter>('all');
    const [sortBy, setSortBy] = useState<SortBy>('trending');

    const navigate = useCallback((path: string, replace = false) => {
        const method = replace ? history.replaceState : history.pushState;
        method.call(history, null, '', path);
        setRoute(getPathRoute());
    }, []);

    useEffect(() => {
        // This effect handles client-side routing.
        const handleLocationChange = () => setRoute(getPathRoute());
        
        // Listen to popstate for browser back/forward navigation
        window.addEventListener('popstate', handleLocationChange);

        // Intercept all internal link clicks to prevent full page reloads
        const handleLinkClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');
            if (anchor && anchor.target !== '_blank' && !e.metaKey && !e.ctrlKey) {
                const url = new URL(anchor.href);
                if (url.origin === window.location.origin) {
                    e.preventDefault();
                    history.pushState(null, '', url.pathname + url.search + url.hash);
                    handleLocationChange();
                }
            }
        };
        document.addEventListener('click', handleLinkClick);

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('popstate', handleLocationChange);
            document.removeEventListener('click', handleLinkClick);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (isAllClearMode) {
            document.body.classList.add('all-clear-mode');
        } else {
            document.body.classList.remove('all-clear-mode');
        }
    }, [isAllClearMode]);

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [trending, popularMovies, popularTv, nowPlaying, comingSoon, topMovies, topTv] = await Promise.all([
                mediaService.getTrending(),
                mediaService.getPopularMovies(),
                mediaService.getPopularTv(),
                mediaService.getNowPlayingMovies(),
                mediaService.getComingSoonMedia(),
                mediaService.getTopRatedMovies(),
                mediaService.getTopRatedTv(),
            ]);
            setTrending(trending);
            setPopularMovies(popularMovies);
            setPopularTv(popularTv);
            setNowPlaying(nowPlaying);
            setComingSoonContent(comingSoon);
            setMoviesContent(topMovies);
            setTvContent(topTv);
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isInitialized && tmdbApiKey) {
            fetchInitialData();
        }
    }, [isInitialized, tmdbApiKey, fetchInitialData]);

    const MIN_ITEMS_FOR_RECOMMENDATIONS = 3;
    const fetchForYouRecommendations = useCallback(async () => {
        if (tmdb.state !== 'authenticated' || watchlist.length < MIN_ITEMS_FOR_RECOMMENDATIONS || isForYouLoading) {
            return;
        }

        setIsForYouLoading(true);
        setForYouError(null);
        
        try {
            const results = await mediaService.getTmdbCuratedRecommendations(watchlist);
            
            if (results.length === 0) {
                setForYouError("Couldn't generate recommendations. Add a few more titles to your watchlist!");
            } else {
                setCuratedRows(results);
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            console.error(errorMessage);
            setForYouError("An error occurred while curating your recommendations.");
        } finally {
            setIsForYouLoading(false);
        }
    }, [watchlist, isForYouLoading, tmdb.state]);

    useEffect(() => {
        const page = route[0] || 'home';
        if (page === 'home' && isInitialized && tmdbApiKey && !isAccountLoading) {
            fetchForYouRecommendations();
        }
    }, [route, isInitialized, tmdbApiKey, isAccountLoading, fetchForYouRecommendations]);

    useEffect(() => {
        const [page, id] = route;
        if (!isInitialized || !tmdbApiKey) return;
    
        const fetchBrandData = async (brandId: string) => {
            if (selectedBrand && selectedBrand.id === brandId) {
                return; // Avoid re-fetching if the correct brand is already loaded
            }
    
            const brand = brands.find(b => b.id === brandId);
            if (brand) {
                setIsLoading(true);
                setSelectedBrand(brand);
                try {
                    let media: MediaDetails[] = [];
                    if (brand.mediaIds && brand.mediaIds.length > 0) {
                        media = await mediaService.fetchMediaByIds(brand.mediaIds);
                    } else if (brand.collectionIds && brand.collectionIds.length > 0) {
                        media = await mediaService.fetchMediaByCollectionIds(brand.collectionIds);
                    } else if (brand.companyId) {
                        media = await mediaService.getMediaByStudio([brand.companyId]);
                    }
                    setBrandContent(media);
                } catch (error) {
                    console.error(`Failed to fetch content for brand ${brand.name}`, error);
                    setBrandContent([]);
                } finally {
                    setIsLoading(false);
                }
            } else if (page === 'brand') {
                navigate('/brands', true); // Redirect if brand not found
            }
        };
    
        if (page === 'brand' && id) {
            fetchBrandData(id);
        } else if (selectedBrand) {
            // Clean up brand data when navigating away
            setSelectedBrand(null);
            setBrandContent([]);
        }
    }, [route, isInitialized, tmdbApiKey, selectedBrand, navigate]);

    useEffect(() => {
        const [page, id] = route;
        if (!isInitialized || !tmdbApiKey) return;
    
        const fetchPersonData = async (personId: string) => {
            if (selectedPerson && selectedPerson.id === personId) {
                return; // Avoid re-fetching
            }
    
            const person = people.find(p => p.id === personId);
            if (person) {
                setIsLoading(true);
                setSelectedPerson(person);
                try {
                    const media = await mediaService.getMediaByPerson(person.tmdbId, person.role);
                    setPersonContent(media);
                } catch (error) {
                    console.error(`Failed to fetch content for person ${person.name}`, error);
                    setPersonContent([]);
                } finally {
                    setIsLoading(false);
                }
            } else if (page === 'person') {
                navigate('/people', true); // Redirect if person not found
            }
        };
    
        if (page === 'person' && id) {
            fetchPersonData(id);
        } else if (selectedPerson) {
            // Clean up person data when navigating away
            setSelectedPerson(null);
            setPersonContent([]);
        }
    }, [route, isInitialized, tmdbApiKey, selectedPerson, navigate]);

    const handleSelectMedia = useCallback(async (media: MediaDetails) => {
        setSelectedActor(null); // Clear actor modal when opening media modal
        setIsDetailLoading(true);
        setSelectedItem(media);
        document.body.classList.add('modal-open');
        try {
            const details = await mediaService.fetchDetailsForModal(media.id, media.type, selectedLocation.code);
            setSelectedItem(prev => prev ? { ...prev, ...details } : null);
        } catch (error) {
            console.error("Failed to fetch full details:", error);
            setSelectedItem(null); // Close modal on error
            document.body.classList.remove('modal-open');
        } finally {
            setIsDetailLoading(false);
        }
    }, [selectedLocation]);

    const handleSelectCollection = useCallback(async (collection: Collection) => {
        setIsDetailLoading(true);
        setSelectedItem(collection);
        document.body.classList.add('modal-open');
        try {
            const details = await mediaService.fetchCollectionDetails(collection.id);
            setSelectedItem(details);
        } catch (error) {
            console.error("Failed to fetch collection details:", error);
        } finally {
            setIsDetailLoading(false);
        }
    }, []);

    const handleSelectActor = useCallback(async (actorId: number) => {
        setSelectedItem(null); // Clear media modal when opening actor modal
        setIsDetailLoading(true);
        setSelectedActor({ id: actorId, name: 'Loading...', biography: '', profilePath: '', birthday: null, placeOfBirth: null, filmography: [] });
        document.body.classList.add('modal-open');
        try {
            const details = await mediaService.fetchActorDetails(actorId);
            setSelectedActor(details);
        } catch (error) {
            console.error("Failed to fetch actor details:", error);
            setSelectedActor(null); // Close actor modal on error
            document.body.classList.remove('modal-open');
        } finally {
            setIsDetailLoading(false);
        }
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedItem(null);
        setSelectedActor(null);
        setIsViewingGuideModalOpen(false);
        document.body.classList.remove('modal-open');
    }, []);
    
    const handleCloseChatModal = useCallback(() => {
        setIsChatModalOpen(false);
        setTimeout(() => {
            setChatMediaItem(null);
            setChatBrandItem(null);
        }, 300);
    }, []);

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setIsLoading(true);
        setIsSearchOpen(false);
        try {
            const results = await mediaService.searchMedia(query);
            setSearchResults(results);
            navigate('/search');
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const openBrandDetail = (brand: Brand) => {
      navigate(`/brand/${brand.id}`);
    };

    const handleGenerateGuides = async (brand: Brand, media: MediaDetails[]) => {
      if (!aiClient) return;
      setIsGuideLoading(true);
      setIsViewingGuideModalOpen(true);
      try {
        const result = await getViewingGuidesForBrand(brand.name, media, aiClient);
        setBrandGuides(result.guides);
      } catch(e) {
        console.error("Failed to generate viewing guides", e);
      } finally {
        setIsGuideLoading(false);
      }
    };
    
    const handleOpenAiDescription = useCallback(async (brand: Brand) => {
        if (!aiClient) return;
        const { canRequest } = canMakeRequest();
        if (!canRequest) {
            console.warn("Rate limit reached, cannot fetch AI description.");
            return;
        }

        setSelectedBrandForDescription(brand);
        setIsAiDescriptionModalOpen(true);
        setIsAiDescriptionLoading(true);
        setAiDescription(null);
        setAiDescriptionError(null);

        try {
            const description = await getAiDescriptionForBrand(brand.name, aiClient);
            incrementRequestCount();
            setAiDescription(description);
        } catch (e: any) {
            setAiDescriptionError(e.message || "Failed to generate description.");
        } finally {
            setIsAiDescriptionLoading(false);
        }
    }, [aiClient, canMakeRequest, incrementRequestCount]);

    const handleCloseAiDescriptionModal = useCallback(() => {
        setIsAiDescriptionModalOpen(false);
        setTimeout(() => {
            setSelectedBrandForDescription(null);
            setAiDescription(null);
            setAiDescriptionError(null);
        }, 300);
    }, []);

    const handleSelectStudio = async (studio: Studio) => {
        setIsLoading(true);
        try {
            const idsToFetch = (studio.companyIds && studio.companyIds.length > 0)
                ? studio.companyIds
                : [studio.id];
            const results = await mediaService.getMediaByStudio(idsToFetch);
            setStudioContent(results);
            navigate(`/studio/${studio.id}`);
        } catch(e) {
            console.error(`Failed to get content for studio ${studio.name}`, e);
        } finally {
            setIsLoading(false);
        }
    };

     const handleSelectNetwork = async (network: Network) => {
        setIsLoading(true);
        try {
            const results = await mediaService.getMediaByNetwork(network.id);
            setNetworkContent(results);
            navigate(`/network/${network.id}`);
        } catch(e) {
            console.error(`Failed to get content for network ${network.name}`, e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectStreamingProvider = async (provider: StreamingProviderInfo) => {
        setIsLoading(true);
        try {
            const results = await mediaService.getMediaByStreamingProvider(provider.key, selectedLocation.code);
            setStreamingContent(results);
            navigate(`/streaming/${provider.key}`);
        } catch(e) {
            console.error(`Failed to get content for provider ${provider.name}`, e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectPerson = (person: Person) => {
        navigate(`/person/${person.id}`);
    };

    const handleOpenChatModal = (media: MediaDetails) => {
        setChatMediaItem(media);
        setIsChatModalOpen(true);
    };

    const handleOpenBrandChatModal = (brand: Brand) => {
        setChatBrandItem(brand);
        setIsChatModalOpen(true);
    };
    
    const handleOpenReminderModal = (media: MediaDetails) => {
        setMediaForReminder(media);
        setIsReminderModalOpen(true);
    };

    const handleCloseReminderModal = useCallback(() => {
        setIsReminderModalOpen(false);
        setTimeout(() => {
            setMediaForReminder(null);
        }, 300);
    }, []);

    const renderPage = () => {
        const page = route[0] === '' ? 'home' : route[0] || 'home';
        const id = route[1];

        if (!isInitialized) {
            return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
        }
        
        if (!tmdbApiKey || !geminiApiKey) {
            return <OnboardingModal onSave={saveApiKeys} />;
        }
        
        if (isLoading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;

        const pageContent = (() => {
            switch(page) {
                case 'home':
                    const forYouContent = () => {
                        if (isAccountLoading) return null;

                        if (tmdb.state !== 'authenticated') {
                             return (
                                <div className="mt-12 md:mt-16 px-4 sm:px-6 lg:px-8">
                                    <div className="text-center text-gray-300 fade-in glass-panel p-8">
                                        <UserIcon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                                        <h2 className="text-2xl font-bold mb-4 text-white">Connect to TMDb</h2>
                                        <p>Log in with your TMDb account in <a href="/myscape" className="font-bold text-white hover:underline">MyScape</a> to get personalized recommendations.</p>
                                    </div>
                                </div>
                            );
                        }

                        if (watchlist.length < MIN_ITEMS_FOR_RECOMMENDATIONS) {
                            return (
                                <div className="mt-12 md:mt-16 px-4 sm:px-6 lg:px-8">
                                    <div className="text-center text-gray-300 fade-in glass-panel p-8">
                                        <ThumbsUpIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
                                        <h2 className="text-2xl font-bold mb-4 text-white">Personalized Recommendations</h2>
                                        <p>Add at least <span className="font-bold text-white">{MIN_ITEMS_FOR_RECOMMENDATIONS}</span> movies or shows to your TMDb watchlist to unlock your feed.</p>
                                        <p className="text-sm mt-2">You have <span className="font-bold text-white">{watchlist.length}</span> items so far.</p>
                                    </div>
                                </div>
                            );
                        }

                        if (isForYouLoading) {
                            return (
                                <div className="mt-12 md:mt-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                                    <h2 className="font-bold text-white mb-4 text-2xl">Finding Recommendations...</h2>
                                    <LoadingSpinner />
                                </div>
                            );
                        }

                        if (forYouError) {
                            return (
                                <div className="mt-12 md:mt-16 px-4 sm:px-6 lg:px-8">
                                    <p className="text-red-400 text-center bg-red-500/10 p-4 rounded-lg">{forYouError}</p>
                                </div>
                            );
                        }
                        
                        if (curatedRows.length > 0) {
                             return (
                                <div className="space-y-12 md:space-y-16 mt-12 md:mt-16">
                                    {curatedRows.map((row, index) => (
                                        <MediaRow 
                                            key={row.title}
                                            title={row.title}
                                            items={row.items}
                                            onSelect={handleSelectMedia}
                                            animationDelay={`${index * 150}ms`}
                                        />
                                    ))}
                                </div>
                            );
                        }

                        return null;
                    };

                    return (
                        <>
                            {trending[0] && <HeroSection item={trending[0]} onMoreInfo={handleSelectMedia} />}
                            <div className="space-y-12 md:space-y-16 mt-8">
                                <MediaRow title="Trending This Week" items={trending} onSelect={handleSelectMedia} />
                                <MediaRow title="Now Playing in Theaters" items={nowPlaying} onSelect={handleSelectMedia} animationDelay="100ms" />
                                <MediaRow title="Popular Movies" items={popularMovies} onSelect={handleSelectMedia} animationDelay="200ms" />
                                <MediaRow title="Popular TV Shows" items={popularTv} onSelect={handleSelectMedia} animationDelay="300ms" />
                            </div>
                            {forYouContent()}
                        </>
                    );
                case 'myscape': return <MyScapePage onSelectMedia={handleSelectMedia} />;
                case 'callback':
                    if (id === 'tmdb') {
                        return <TmdbCallbackPage onNavigate={navigate} />;
                    }
                    navigate('/', true);
                    return null;
                case 'movies': return <RecommendationGrid recommendations={moviesContent} onSelect={handleSelectMedia} />;
                case 'tv': return <RecommendationGrid recommendations={tvContent} onSelect={handleSelectMedia} />;
                case 'collections': return <ComingSoonPage media={comingSoonContent} onSelectMedia={handleSelectMedia} />;
                case 'studios': return <StudioGrid studios={popularStudios} onSelect={handleSelectStudio} />;
                case 'brands':
                    return <BrandGrid brands={brands} onSelect={openBrandDetail} onAiInfoClick={handleOpenAiDescription} />;
                case 'streaming':
                    if (id) {
                        return <RecommendationGrid recommendations={streamingContent} onSelect={handleSelectMedia} />;
                    } else {
                        return <StreamingGrid providers={supportedProviders} onSelect={handleSelectStreamingProvider} />;
                    }
                case 'networks':
                    return <NetworkGrid networks={popularNetworks} onSelect={handleSelectNetwork} />;
                case 'people':
                    return <PersonGrid people={people} onSelect={handleSelectPerson} />;
                case 'search':
                    return <RecommendationGrid recommendations={searchResults} onSelect={handleSelectMedia} />;
                case 'brand':
                    if (selectedBrand) {
                        return <BrandDetail brand={selectedBrand} media={brandContent} onBack={() => navigate('/brands')} onSelectMedia={handleSelectMedia} onSelectCollection={handleSelectCollection} mediaTypeFilter={mediaTypeFilter} setMediaTypeFilter={setMediaTypeFilter} sortBy={sortBy} setSortBy={setSortBy} onGenerateGuides={handleGenerateGuides} onOpenChat={handleOpenBrandChatModal} />;
                    }
                    return <div className="text-center">Loading brand...</div>;
                case 'studio':
                    return <RecommendationGrid recommendations={studioContent} onSelect={handleSelectMedia} />;
                case 'network':
                    return <RecommendationGrid recommendations={networkContent} onSelect={handleSelectMedia} />;
                case 'person':
                    if (selectedPerson) {
                        return <PersonPage 
                                    person={selectedPerson} 
                                    media={personContent} 
                                    onBack={() => navigate('/people')} 
                                    onSelectMedia={handleSelectMedia}
                                    onSelectActor={handleSelectActor} />;
                    }
                    return <div className="text-center">Loading talent...</div>;
                default:
                     navigate('/', true);
                     return null;
            }
        })();
        
        // Render the home page with a full-width layout for an immersive feel.
        if (page === 'home') {
            return pageContent;
        }

        // For all other pages, wrap content in a container to maintain a centered, readable layout.
        if (pageContent) {
            return (
                <div className="pt-20">
                    <div className="page-container">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
                            {pageContent}
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };
    
    const PillNavigation: React.FC = () => {
       const activeRoute = route[0] === '' ? 'home' : route[0] || 'home';
       return (
            <div className={`transition-transform duration-500 ease-in-out ${isScrolled ? 'scale-90' : 'scale-100'}`}>
                <div className="flex items-center gap-1 p-1 sm:p-1.5 glass-panel rounded-full">
                    <a href="/" className={`flex items-center justify-center p-2.5 sm:px-4 sm:py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${activeRoute === 'home' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}>
                        <HomeIcon className="w-5 h-5 sm:hidden" />
                        <span className="hidden sm:inline">Home</span>
                    </a>
                    <button onClick={() => setIsSearchOpen(true)} className="p-2.5 rounded-full hover:bg-white/5 transition-colors" aria-label="Open Search">
                        <SearchIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setIsAiSearchOpen(true)} className="flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-full transition-colors" aria-label="Open ScapeAI Search">
                        <img src="https://img.icons8.com/?size=100&id=eoxMN35Z6JKg&format=png&color=FFFFFF" alt="ScapeAI logo" className="w-5 h-5" />
                        <span className="hidden sm:inline">ScapeAI</span>
                    </button>
                     <button onClick={() => setIsBrowseMenuOpen(true)} className="flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-300 bg-white/5 hover:bg-white/10 rounded-full transition-colors" aria-label="Open browse menu">
                        <GridIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Browse</span>
                    </button>
                    <a href="/myscape" className={`flex items-center justify-center p-2.5 sm:px-4 sm:py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${activeRoute === 'myscape' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}>
                        <UserIcon className="w-5 h-5 sm:hidden" />
                        <span className="hidden sm:inline">MyScape</span>
                    </a>
                </div>
            </div>
       );
    };

    return (
        <div id="app-container" className="min-h-screen">
            <header className={`fixed top-4 left-0 right-0 z-50 flex justify-center items-center transition-all duration-300 ease-in-out`}>
                <PillNavigation />
            </header>

            <main className="transition-opacity duration-500">
                <Suspense fallback={<div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>}>
                    {renderPage()}
                </Suspense>
            </main>

            {selectedItem && (
              <div 
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 modal-backdrop-overlay"
                onClick={handleCloseModal}
              >
                <DetailModal 
                    item={selectedItem}
                    onClose={handleCloseModal}
                    isLoading={isDetailLoading}
                    onSelectMedia={handleSelectMedia}
                    onSelectActor={handleSelectActor}
                    selectedLocation={selectedLocation}
                    onLocationChange={setSelectedLocation}
                    onOpenChat={handleOpenChatModal}
                    onOpenReminderModal={handleOpenReminderModal}
                />
              </div>
            )}
            
            {selectedActor && (
                <div 
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 modal-backdrop-overlay"
                    onClick={handleCloseModal}
                >
                    <ActorPage 
                        actor={selectedActor}
                        onBack={handleCloseModal}
                        onSelectMedia={handleSelectMedia}
                        isLoading={isDetailLoading}
                    />
                </div>
            )}

            {isSearchOpen && <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onSearch={handleSearch} isLoading={isLoading} />}
            {isAiSearchOpen && <AiSearchModal isOpen={isAiSearchOpen} onClose={() => setIsAiSearchOpen(false)} onSelectMedia={handleSelectMedia} />}
            {isViewingGuideModalOpen && selectedBrand && <ViewingGuideModal isOpen={isViewingGuideModalOpen} onClose={handleCloseModal} isLoading={isGuideLoading} brandName={selectedBrand.name} guides={brandGuides} onSelectMedia={handleSelectMedia} />}
            {isBrowseMenuOpen && <BrowseMenuModal isOpen={isBrowseMenuOpen} onClose={() => setIsBrowseMenuOpen(false)} />}
            {isChatModalOpen && <ChatModal isOpen={isChatModalOpen} onClose={handleCloseChatModal} media={chatMediaItem || undefined} brand={chatBrandItem || undefined} />}
            {isAiDescriptionModalOpen && selectedBrandForDescription && <AiDescriptionModal isOpen={isAiDescriptionModalOpen} onClose={handleCloseAiDescriptionModal} isLoading={isAiDescriptionLoading} title={selectedBrandForDescription.name} description={aiDescription} error={aiDescriptionError} />}
            {isReminderModalOpen && mediaForReminder && <ReminderModal isOpen={isReminderModalOpen} onClose={handleCloseReminderModal} media={mediaForReminder} />}
        </div>
    );
};

export default App;