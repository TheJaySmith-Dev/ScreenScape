// FIX: Correctly import React hooks (useState, useEffect, useCallback) to resolve 'Cannot find name' errors.
import React, { useState, useEffect, useCallback } from 'react';
import { HeroSection } from './components/HeroSection.tsx';
import { MediaRow } from './components/MediaRow.tsx';
import { DetailModal } from './components/DetailModal.tsx';
import { ForYouPage } from './components/ForYouPage.tsx';
import { MyScapePage } from './components/MyScapePage.tsx';
import { LoadingSpinner } from './components/LoadingSpinner.tsx';
import { StudioGrid } from './components/StudioGrid.tsx';
import { BrandGrid } from './components/BrandGrid.tsx';
import { NetworkGrid } from './components/NetworkGrid.tsx';
import { StreamingGrid } from './components/StreamingGrid.tsx';
import { BrandDetail } from './components/BrandDetail.tsx';
import { RecommendationGrid } from './components/RecommendationGrid.tsx';
import { ActorPage } from './components/ActorPage.tsx';
import { ComingSoonPage } from './components/ComingSoonPage.tsx';
import { DiscoverPage } from './components/DiscoverPage.tsx';
import { ApiKeyModal } from './components/ApiKeyModal.tsx';
import { AiSearchModal } from './components/AiSearchModal.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { ViewingGuideModal } from './components/ViewingGuideModal.tsx';
import { BrowseMenuModal } from './components/MobileMenuModal.tsx';
import { ChatModal } from './components/ChatModal.tsx';
import { MDBListCarousel } from './components/MDBListCarousel.tsx';
import { AiDescriptionModal } from './components/AiDescriptionModal.tsx';
import { UserIcon, SearchIcon, GridIcon } from './components/icons.tsx';

import * as mediaService from './services/mediaService.ts';
import { popularStudios } from './services/studioService.ts';
import { brands } from './services/brandService.ts';
import { supportedProviders } from './services/streamingService.ts';
import { popularNetworks } from './services/networkService.ts';

import type { MediaDetails, CollectionDetails, Collection, ActorDetails, Brand, Studio, Network, StreamingProviderInfo, UserLocation, ViewingGuide, MediaTypeFilter, SortBy } from './types.ts';
import { getViewingGuidesForBrand, getAiDescriptionForBrand } from './services/aiService.ts';
import { useSettings } from './hooks/useSettings.ts';

const getHashRoute = () => window.location.hash.replace(/^#\/?|\/$/g, '').split('/');

const App: React.FC = () => {
    const { tmdbApiKey, geminiApiKey, saveApiKeys, isInitialized, aiClient, isAllClearMode, canMakeRequest, incrementRequestCount } = useSettings();
    const [route, setRoute] = useState<string[]>(getHashRoute());
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
    const [streamingContent, setStreamingContent] = useState<MediaDetails[]>([]);
    const [moviesContent, setMoviesContent] = useState<MediaDetails[]>([]);
    const [tvContent, setTvContent] = useState<MediaDetails[]>([]);
    const [comingSoonContent, setComingSoonContent] = useState<MediaDetails[]>([]);
    const [releasedTodayContent, setReleasedTodayContent] = useState<MediaDetails[]>([]);

    // Modal/Detail states
    const [selectedItem, setSelectedItem] = useState<MediaDetails | CollectionDetails | null>(null);
    const [selectedActor, setSelectedActor] = useState<ActorDetails | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isAiSearchOpen, setIsAiSearchOpen] = useState(false);
    const [isViewingGuideModalOpen, setIsViewingGuideModalOpen] = useState(false);
    const [isBrowseMenuOpen, setIsBrowseMenuOpen] = useState(false);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [chatMediaItem, setChatMediaItem] = useState<MediaDetails | null>(null);
    const [chatBrandItem, setChatBrandItem] = useState<Brand | null>(null);
    const [brandGuides, setBrandGuides] = useState<ViewingGuide[]>([]);
    const [isGuideLoading, setIsGuideLoading] = useState(false);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    
    // AI Description Modal state
    const [isAiDescriptionModalOpen, setIsAiDescriptionModalOpen] = useState(false);
    const [selectedBrandForDescription, setSelectedBrandForDescription] = useState<Brand | null>(null);
    const [aiDescription, setAiDescription] = useState<string | null>(null);
    const [isAiDescriptionLoading, setIsAiDescriptionLoading] = useState(false);
    const [aiDescriptionError, setAiDescriptionError] = useState<string | null>(null);

    // Filter states
    const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaTypeFilter>('all');
    const [sortBy, setSortBy] = useState<SortBy>('trending');

    useEffect(() => {
        const handleHashChange = () => setRoute(getHashRoute());
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
            const scrollY = window.scrollY;
            document.body.style.backgroundPositionY = `${scrollY * 0.5}px`;
        };
        window.addEventListener('hashchange', handleHashChange);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // LIQUID GLASS - Interactive light effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const panels = document.querySelectorAll<HTMLElement>('.glass-panel');
            for (const panel of panels) {
                const rect = panel.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                panel.style.setProperty('--liquid-light-x', `${x}px`);
                panel.style.setProperty('--liquid-light-y', `${y}px`);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // LIQUID GLASS - Hover effect for panels
    useEffect(() => {
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const panel = target.closest('.glass-panel') as HTMLElement;
            if (panel) {
                panel.style.setProperty('--liquid-light-color', 'rgba(120, 140, 255, 0.4)');
                panel.style.setProperty('--liquid-saturate', '2.0');
                panel.style.setProperty('--liquid-transform', 'scale(1.03) translateY(-5px)');
            }
        };

        const handleMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const panel = target.closest('.glass-panel') as HTMLElement;
            if (panel) {
                // Revert to the default values from the stylesheet
                panel.style.removeProperty('--liquid-light-color');
                panel.style.removeProperty('--liquid-saturate');
                panel.style.removeProperty('--liquid-transform');
            }
        };

        document.body.addEventListener('mouseover', handleMouseOver);
        document.body.addEventListener('mouseout', handleMouseOut);

        return () => {
            document.body.removeEventListener('mouseover', handleMouseOver);
            document.body.removeEventListener('mouseout', handleMouseOut);
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
            const today = new Date();
            const month = today.getMonth() + 1;
            const day = today.getDate();

            const results = await Promise.allSettled([
                mediaService.getTrending(),
                mediaService.getPopularMovies(),
                mediaService.getPopularTv(),
                mediaService.getNowPlayingMovies(),
                mediaService.getComingSoonMedia(),
                mediaService.getTopRatedMovies(),
                mediaService.getTopRatedTv(),
                mediaService.getMoviesReleasedOn(month, day),
            ]);

            const [
                trending,
                popularMovies,
                popularTv,
                nowPlaying,
                comingSoon,
                topMovies,
                topTv,
                releasedToday
            ] = results.map(result => (result.status === 'fulfilled' ? result.value : []));

            setTrending(trending as MediaDetails[]);
            setPopularMovies(popularMovies as MediaDetails[]);
            setPopularTv(popularTv as MediaDetails[]);
            setNowPlaying(nowPlaying as MediaDetails[]);
            setComingSoonContent(comingSoon as MediaDetails[]);
            setMoviesContent(topMovies as MediaDetails[]);
            setTvContent(topTv as MediaDetails[]);
            setReleasedTodayContent(releasedToday as MediaDetails[]);
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isInitialized && tmdbApiKey) {
            fetchInitialData();
            // Fetch user location
            fetch('https://ipinfo.io/json?token=a0c105b32a98f7')
                .then(res => res.json())
                .then(data => {
                    // Defensive check to ensure data.country exists and is a non-empty string
                    if (data && typeof data.country === 'string' && data.country.trim() !== '') {
                        setUserLocation({ name: data.country, code: data.country });
                    } else {
                        // Fallback if the API response is malformed or missing the country
                        console.warn("ipinfo.io did not return a valid country. Falling back to US.");
                        setUserLocation({ name: 'United States', code: 'US' });
                    }
                })
                .catch(error => {
                    console.error("Failed to fetch user location:", error);
                    setUserLocation({ name: 'United States', code: 'US' }); // Fallback for network errors
                });
        }
    }, [isInitialized, tmdbApiKey, fetchInitialData]);

    // FIX: Add a useEffect hook to handle fetching data for brand pages based on the current route.
    // This ensures content loads correctly on both direct navigation and clicks.
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
                window.location.hash = '/brands'; // Redirect if brand not found
            }
        };
    
        if (page === 'brand' && id) {
            fetchBrandData(id);
        } else if (selectedBrand) {
            // Clean up brand data when navigating away
            setSelectedBrand(null);
            setBrandContent([]);
        }
    }, [route, isInitialized, tmdbApiKey, selectedBrand]);

    const handleSelectMedia = useCallback(async (media: MediaDetails) => {
        setSelectedActor(null); // Clear actor modal when opening media modal
        setIsDetailLoading(true);
        setSelectedItem(media);
        document.body.classList.add('modal-open');
        try {
            const details = await mediaService.fetchDetailsForModal(media.id, media.type, userLocation?.code || 'US');
            setSelectedItem(prev => prev ? { ...prev, ...details } : null);
        } catch (error) {
            console.error("Failed to fetch full details:", error);
            setSelectedItem(null); // Close modal on error
            document.body.classList.remove('modal-open');
        } finally {
            setIsDetailLoading(false);
        }
    }, [userLocation]);

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
            window.location.hash = '/search';
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // FIX: Simplify the brand selection function to only change the URL hash.
    // The new useEffect hook will handle the data fetching and state updates.
    const openBrandDetail = (brand: Brand) => {
      window.location.hash = `/brand/${brand.id}`;
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
            window.location.hash = `/studio/${studio.id}`;
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
            window.location.hash = `/network/${network.id}`;
        } catch(e) {
            console.error(`Failed to get content for network ${network.name}`, e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectStreamingProvider = async (provider: StreamingProviderInfo) => {
        setIsLoading(true);
        try {
            if (provider.key === 'disney') {
                setStreamingContent([]);
            } else {
                const results = await mediaService.getMediaByStreamingProvider(provider.key, userLocation?.code || 'US');
                setStreamingContent(results);
            }
            window.location.hash = `/streaming/${provider.key}`;
        } catch(e) {
            console.error(`Failed to get content for provider ${provider.name}`, e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChatModal = (media: MediaDetails) => {
        setChatMediaItem(media);
        setIsChatModalOpen(true);
    };

    const handleOpenBrandChatModal = (brand: Brand) => {
        setChatBrandItem(brand);
        setIsChatModalOpen(true);
    };

    const renderPage = () => {
        const page = route[0] || 'home';
        const id = route[1];

        if (!isInitialized) {
            return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
        }
        
        if (!tmdbApiKey || !geminiApiKey) {
            return <ApiKeyModal onSave={saveApiKeys} onClose={() => {}} />;
        }
        
        if (isLoading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;

        const pageContent = (() => {
            switch(page) {
                case 'home':
                    return (
                        <>
                            {trending[0] && <HeroSection item={trending[0]} onPlay={() => {}} onMoreInfo={handleSelectMedia} />}
                            <div className="space-y-12 md:space-y-16 mt-8">
                                <MediaRow title="Trending This Week" items={trending} onSelect={handleSelectMedia} />
                                {releasedTodayContent.length > 0 && <MediaRow title="Released Today" items={releasedTodayContent} onSelect={handleSelectMedia} animationDelay="100ms" />}
                                <MediaRow title="Now Playing in Theaters" items={nowPlaying} onSelect={handleSelectMedia} animationDelay="100ms" />
                                <MediaRow title="Popular Movies" items={popularMovies} onSelect={handleSelectMedia} animationDelay="200ms" />
                                <MediaRow title="Popular TV Shows" items={popularTv} onSelect={handleSelectMedia} animationDelay="300ms" />
                            </div>
                        </>
                    );
                case 'foryou': return <ForYouPage onSelectMedia={handleSelectMedia} />;
                case 'myscape': return <MyScapePage onSelectMedia={handleSelectMedia} />;
                case 'movies': return <RecommendationGrid recommendations={moviesContent} onSelect={handleSelectMedia} />;
                case 'tv': return <RecommendationGrid recommendations={tvContent} onSelect={handleSelectMedia} />;
                case 'discover': return <DiscoverPage onSelectMedia={handleSelectMedia} />;
                case 'collections': return <ComingSoonPage media={comingSoonContent} onSelectMedia={handleSelectMedia} />;
                case 'studios': return <StudioGrid studios={popularStudios} onSelect={handleSelectStudio} />;
                case 'brands':
                    return <BrandGrid brands={brands} onSelect={openBrandDetail} onAiInfoClick={handleOpenAiDescription} />;
                case 'streaming':
                    if (id) {
                        if (id === 'disney') {
                            return (
                                <div className="space-y-12 md:space-y-16">
                                    <MDBListCarousel listId="sig1878/disney-movies" title="Disney+ Movies on MDBList" onSelectMedia={handleSelectMedia} />
                                    <MDBListCarousel listId="sig1878/disney-tv" title="Disney+ TV on MDBList" onSelectMedia={handleSelectMedia} />
                                </div>
                            );
                        } else {
                            return <RecommendationGrid recommendations={streamingContent} onSelect={handleSelectMedia} />;
                        }
                    } else {
                        return <StreamingGrid providers={supportedProviders} onSelect={handleSelectStreamingProvider} />;
                    }
                case 'networks':
                    return <NetworkGrid networks={popularNetworks} onSelect={handleSelectNetwork} />;
                case 'search':
                    return <RecommendationGrid recommendations={searchResults} onSelect={handleSelectMedia} />;
                case 'brand':
                    if (selectedBrand) {
                        return <BrandDetail brand={selectedBrand} media={brandContent} onBack={() => window.location.hash = '/brands'} onSelectMedia={handleSelectMedia} onSelectCollection={handleSelectCollection} mediaTypeFilter={mediaTypeFilter} setMediaTypeFilter={setMediaTypeFilter} sortBy={sortBy} setSortBy={setSortBy} onGenerateGuides={handleGenerateGuides} onOpenChat={handleOpenBrandChatModal} />;
                    }
                    return <div className="text-center">Loading brand...</div>;
                case 'studio':
                    return <RecommendationGrid recommendations={studioContent} onSelect={handleSelectMedia} />;
                case 'network':
                    return <RecommendationGrid recommendations={networkContent} onSelect={handleSelectMedia} />;
                default:
                     window.location.hash = '/home';
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
    
    // PHASE 1: Navigation Simplification
    // The following navigation changes are the first phase of a larger UI enhancement.
    // The "Discover" link is promoted to the main navigation for desktop/tablet,
    // while the "Browse" button is hidden on those views to simplify the main navigation paths.
    // The "Dynamic Title Tiles" feature will be implemented in the next phase.
    const PillNavigation: React.FC = () => {
       const activeRoute = route[0] || 'home';
       return (
            <div className={`transition-transform duration-500 ease-in-out ${isScrolled ? 'scale-90' : 'scale-100'}`}>
                <div className="flex items-center gap-1 p-1.5 glass-panel rounded-full">
                    <a href="#/home" className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${activeRoute === 'home' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}>Home</a>
                    <a href="#/discover" className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${activeRoute === 'discover' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}>Discover</a>
                    <button onClick={() => setIsSearchOpen(true)} className="p-2.5 rounded-full hover:bg-white/5 transition-colors" aria-label="Open Search">
                        <SearchIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setIsAiSearchOpen(true)} className="flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-full transition-colors" aria-label="Open ScapeAI Search">
                        <img src="https://img.icons8.com/?size=100&id=eoxMN35Z6JKg&format=png&color=FFFFFF" alt="ScapeAI logo" className="w-5 h-5" />
                        <span>ScapeAI</span>
                    </button>
                     <button onClick={() => setIsBrowseMenuOpen(true)} className="flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-300 hover:bg-white/5 rounded-full transition-colors" aria-label="Open More Menu">
                        <GridIcon className="w-5 h-5" />
                        <span>More</span>
                    </button>
                    {/* Visual separator */}
                    <div className="w-px h-6 bg-white/10 mx-1"></div>
                    <a href="#/myscape" className={`p-2.5 rounded-full transition-colors ${activeRoute === 'myscape' ? 'bg-white/10' : 'hover:bg-white/5'}`} aria-label="MyScape">
                        <UserIcon className="w-6 h-6" />
                    </a>
                </div>
            </div>
       );
    };

    const isMedia = selectedItem && 'type' in selectedItem;
    // FIX: Correctly determine the modal's backdrop URL. This logic handles media items (with/without textless backdrops) and collections, ensuring the background always displays.
    const backdropUrl = selectedItem 
        ? (isMedia 
            ? ((selectedItem as MediaDetails).textlessBackdropUrl || (selectedItem as MediaDetails).backdropUrl) 
            : (selectedItem as CollectionDetails).backdropUrl) 
        : null;

    return (
      <div className="min-h-screen">
          <header className="fixed top-0 left-0 right-0 z-40 p-4 hidden md:flex items-center justify-center">
              <PillNavigation />
          </header>
          
          <main className="pb-24 md:pb-0">
              {renderPage()}
          </main>
          
          {(selectedItem || selectedActor) && (
              <div
                className="fixed inset-0 z-50 overflow-y-auto"
                onClick={handleCloseModal}
              >
                  <div className="fixed inset-0 -z-10">
                      {backdropUrl && (
                          <img src={backdropUrl} alt="" className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 modal-backdrop-overlay" />
                  </div>

                  <div className="flex items-center justify-center min-h-full p-4">
                       {selectedItem && (
                            <DetailModal item={selectedItem} onClose={handleCloseModal} isLoading={isDetailLoading} onSelectMedia={handleSelectMedia} onSelectActor={handleSelectActor} userLocation={userLocation} onOpenChat={handleOpenChatModal} />
                       )}
                       {selectedActor && (
                            <div onClick={(e) => e.stopPropagation()}>
                                <ActorPage actor={selectedActor} onBack={handleCloseModal} onSelectMedia={handleSelectMedia} isLoading={isDetailLoading} />
                            </div>
                       )}
                  </div>
              </div>
          )}

          <SearchModal 
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onSearch={handleSearch}
            isLoading={isLoading}
          />
          <AiSearchModal 
            isOpen={isAiSearchOpen}
            onClose={() => setIsAiSearchOpen(false)}
            onSelectMedia={handleSelectMedia}
          />
          <ViewingGuideModal 
            isOpen={isViewingGuideModalOpen}
            onClose={() => setIsViewingGuideModalOpen(false)}
            isLoading={isGuideLoading}
            brandName={selectedBrand?.name || ''}
            guides={brandGuides}
            onSelectMedia={handleSelectMedia}
          />

          {(chatMediaItem || chatBrandItem) && (
              <ChatModal 
                isOpen={isChatModalOpen}
                onClose={handleCloseChatModal}
                media={chatMediaItem ?? undefined}
                brand={chatBrandItem ?? undefined}
              />
          )}

          <AiDescriptionModal
            isOpen={isAiDescriptionModalOpen}
            onClose={handleCloseAiDescriptionModal}
            isLoading={isAiDescriptionLoading}
            title={selectedBrandForDescription?.name || ''}
            description={aiDescription}
            error={aiDescriptionError}
          />

          <nav className="mobile-dock md:hidden">
              <PillNavigation />
          </nav>

          <BrowseMenuModal
            isOpen={isBrowseMenuOpen}
            onClose={() => setIsBrowseMenuOpen(false)}
          />
      </div>
    );
};

export default App;