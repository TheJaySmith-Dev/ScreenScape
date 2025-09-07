
import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from './components/Navigation.tsx';
import { SearchBar } from './components/SearchBar.tsx';
import { AccountButton } from './components/AccountButton.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { MediaRow } from './components/MediaRow.tsx';
import { DetailModal } from './components/DetailModal.tsx';
import { ForYouPage } from './components/ForYouPage.tsx';
import { MyScapePage } from './components/MyScapePage.tsx';
import { GamePage } from './components/GamePage.tsx';
import { LoadingSpinner } from './components/LoadingSpinner.tsx';
import { StudioGrid } from './components/StudioGrid.tsx';
import { BrandGrid } from './components/BrandGrid.tsx';
import { NetworkGrid } from './components/NetworkGrid.tsx';
import { PersonGrid } from './components/PersonGrid.tsx';
import { StreamingGrid } from './components/StreamingGrid.tsx';
import { BrandDetail } from './components/BrandDetail.tsx';
import { RecommendationGrid } from './components/RecommendationGrid.tsx';
import { ActorPage } from './components/ActorPage.tsx';
import { ComingSoonPage } from './components/ComingSoonPage.tsx';
import { ApiKeyModal } from './components/ApiKeyModal.tsx';
import { AiSearchModal } from './components/AiSearchModal.tsx';
import { ViewingGuideModal } from './components/ViewingGuideModal.tsx';
import { GuideModal } from './components/GuideModal.tsx';
import { QuestionMarkCircleIcon, SparklesIcon } from './components/icons.tsx';
import { MobileNavigation } from './components/MobileNavigation.tsx';
import { MobileMenuModal } from './components/MobileMenuModal.tsx';

import * as mediaService from './services/mediaService.ts';
import { popularStudios } from './services/studioService.ts';
import { brands } from './services/brandService.ts';
import { supportedProviders } from './services/streamingService.ts';
import { popularNetworks } from './services/networkService.ts';
import { people } from './services/peopleService.ts';

import type { MediaDetails, CollectionDetails, Collection, ActorDetails, Brand, Person, Studio, Network, StreamingProviderInfo, UserLocation, ViewingGuide, MediaTypeFilter, SortBy } from './types.ts';
import { getViewingGuidesForBrand } from './services/aiService.ts';
import { useSettings } from './hooks/useSettings.ts';
import { useAuth } from './hooks/useAuth.ts';
import { SignInPrompt } from './components/SignInPrompt.tsx';

const getHashRoute = () => window.location.hash.replace(/^#\/?|\/$/g, '').split('/');

const App: React.FC = () => {
    const { tmdbApiKey, geminiApiKey, saveApiKeys, isInitialized, aiClient } = useSettings();
    const { currentUser, loading: authLoading } = useAuth();
    const [route, setRoute] = useState<string[]>(getHashRoute());
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    
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

    // Modal/Detail states
    const [selectedItem, setSelectedItem] = useState<MediaDetails | CollectionDetails | null>(null);
    const [selectedActor, setSelectedActor] = useState<ActorDetails | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [isAiSearchOpen, setIsAiSearchOpen] = useState(false);
    const [isViewingGuideModalOpen, setIsViewingGuideModalOpen] = useState(false);
    const [isAppGuideOpen, setIsAppGuideOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [brandGuides, setBrandGuides] = useState<ViewingGuide[]>([]);
    const [isGuideLoading, setIsGuideLoading] = useState(false);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

    // Filter states
    const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaTypeFilter>('all');
    const [sortBy, setSortBy] = useState<SortBy>('trending');

    useEffect(() => {
      const handleHashChange = () => setRoute(getHashRoute());
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

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
        if (isInitialized && tmdbApiKey && (currentUser || !authLoading)) {
            fetchInitialData();
             // Fetch user location
            fetch('https://ipinfo.io/json?token=a0c105b32a98f7')
                .then(res => res.json())
                .then(data => setUserLocation({ name: data.country, code: data.country }))
                .catch(() => setUserLocation({ name: 'United States', code: 'US' })); // Fallback
        }
    }, [isInitialized, tmdbApiKey, fetchInitialData, currentUser, authLoading]);

    const handleSelectMedia = useCallback(async (media: MediaDetails) => {
        setIsDetailLoading(true);
        setSelectedItem(media);
        document.body.classList.add('modal-open');
        try {
            const details = await mediaService.fetchDetailsForModal(media.id, media.type, userLocation?.code || 'US');
            setSelectedItem(prev => prev ? { ...prev, ...details } : null);
        } catch (error) {
            console.error("Failed to fetch full details:", error);
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
        setIsDetailLoading(true);
        setSelectedActor({ id: actorId, name: 'Loading...', biography: '', profilePath: '', birthday: null, placeOfBirth: null, filmography: [] });
        document.body.classList.add('modal-open');
        try {
            const details = await mediaService.fetchActorDetails(actorId);
            setSelectedActor(details);
            window.location.hash = `/actor/${actorId}`;
        } catch (error) {
            console.error("Failed to fetch actor details:", error);
        } finally {
            setIsDetailLoading(false);
        }
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedItem(null);
        setSelectedActor(null);
        setSelectedBrand(null);
        setIsViewingGuideModalOpen(false);
        document.body.classList.remove('modal-open');
        window.history.pushState("", document.title, window.location.pathname + window.location.search); // Clears hash
    }, []);

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setIsLoading(true);
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
    
    const openBrandDetail = (brand: Brand) => {
      setSelectedBrand(brand);
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

    const handleSelectStudio = async (studio: Studio) => {
        setIsLoading(true);
        try {
            const results = await mediaService.getMediaByStudio(studio.id);
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
            const results = await mediaService.getMediaByStreamingProvider(provider.key, userLocation?.code || 'US');
            setStreamingContent(results);
            window.location.hash = `/streaming/${provider.key}`;
        } catch(e) {
            console.error(`Failed to get content for provider ${provider.name}`, e);
        } finally {
            setIsLoading(false);
        }
    };

     const handleSelectPerson = async (person: Person) => {
        setIsLoading(true);
        try {
            const results = await mediaService.getMediaByPerson(person.tmdbId, person.role);
            setPersonContent(results);
            window.location.hash = `/person/${person.id}`;
        } catch(e) {
            console.error(`Failed to get content for person ${person.name}`, e);
        } finally {
            setIsLoading(false);
        }
    };

    const renderPage = () => {
        const page = route[0] || 'home';
        const id = route[1];

        if (authLoading || !isInitialized) {
            return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
        }

        if (!currentUser) {
            return <SignInPrompt />;
        }
        
        if (!tmdbApiKey || !geminiApiKey) {
            return <ApiKeyModal onSave={saveApiKeys} onClose={() => {}} />;
        }
        
        if (isLoading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;

        switch(page) {
            case 'home':
                return (
                    <>
                        {trending[0] && <HeroSection item={trending[0]} onPlay={() => {}} onMoreInfo={handleSelectMedia} />}
                        <div className="space-y-12 md:space-y-16 mt-8">
                            <MediaRow title="Trending This Week" items={trending} onSelect={handleSelectMedia} />
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
            case 'collections': return <ComingSoonPage media={comingSoonContent} onSelectMedia={handleSelectMedia} />;
            case 'game': return <GamePage />;
            case 'studios': return <StudioGrid studios={popularStudios} onSelect={handleSelectStudio} />;
            case 'brands':
                return <BrandGrid brands={brands} onSelect={openBrandDetail} />;
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
                    return <BrandDetail brand={selectedBrand} media={brandContent} onBack={() => window.location.hash = '/brands'} onSelectMedia={handleSelectMedia} onSelectCollection={handleSelectCollection} mediaTypeFilter={mediaTypeFilter} setMediaTypeFilter={setMediaTypeFilter} sortBy={sortBy} setSortBy={setSortBy} />;
                }
                return <div className="text-center">Loading brand...</div>;
            case 'actor':
                if (selectedActor) {
                    return <ActorPage actor={selectedActor} onBack={handleCloseModal} onSelectMedia={handleSelectMedia} />;
                }
                return <div className="text-center">Loading actor...</div>;

            // FIX: Removed duplicate 'streaming' case and separated grouped cases to use correct content state.
            case 'studio':
                return <RecommendationGrid recommendations={studioContent} onSelect={handleSelectMedia} />;
            case 'network':
                return <RecommendationGrid recommendations={networkContent} onSelect={handleSelectMedia} />;
            case 'person':
                return <RecommendationGrid recommendations={personContent} onSelect={handleSelectMedia} />;
            default:
                return <div>Page not found</div>;
        }
    };

    return (
      <div className="min-h-screen">
          <header className="fixed top-0 left-0 right-0 z-40 p-4">
              <div className="container mx-auto flex items-center justify-between gap-4">
                  <div className="flex-1 flex justify-start">
                     <button onClick={() => setIsAppGuideOpen(true)} className="p-2 glass-panel rounded-full hover:bg-white/5 transition-colors" aria-label="Open App Guide">
                          <QuestionMarkCircleIcon className="w-6 h-6 text-gray-300" />
                      </button>
                  </div>
                  <div className="flex-1 hidden md:flex justify-center">
                    {/* FIX: Cast route value to 'any' to satisfy the 'ActiveTab' type, as the type is not exported. */}
                    <Navigation activeTab={(route[0] || 'home') as any} />
                  </div>
                  <div className="flex-1 flex justify-end items-center gap-3">
                      <button onClick={() => setIsAiSearchOpen(true)} className="p-2 glass-panel rounded-full hover:bg-white/5 transition-colors" aria-label="Open AI Search">
                          <SparklesIcon className="w-6 h-6 text-indigo-400" />
                      </button>
                      <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                      <AccountButton userLocation={userLocation} />
                  </div>
              </div>
          </header>
          
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
              {renderPage()}
          </main>
          
          {(selectedItem || selectedActor) && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 overflow-y-auto">
                   {selectedItem && <DetailModal item={selectedItem} onClose={handleCloseModal} isLoading={isDetailLoading} onSelectMedia={handleSelectMedia} onSelectActor={handleSelectActor} userLocation={userLocation} />}
                   {selectedActor && <ActorPage actor={selectedActor} onBack={handleCloseModal} onSelectMedia={handleSelectMedia} />}
              </div>
          )}

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
          <GuideModal 
            isOpen={isAppGuideOpen}
            onClose={() => setIsAppGuideOpen(false)}
          />

          <MobileNavigation 
            activeTab={route[0] || 'home'}
            onSearchClick={() => setIsAiSearchOpen(true)}
            onMoreClick={() => setIsMobileMenuOpen(true)}
          />
          <MobileMenuModal
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
      </div>
    );
};

export default App;
