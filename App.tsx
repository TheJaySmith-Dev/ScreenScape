
import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from './components/Navigation.tsx';
import { SearchBar } from './components/SearchBar.tsx';
import { AccountButton } from './components/AccountButton.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { MediaRow } from './components/MediaRow.tsx';
import { DetailModal } from './components/DetailModal.tsx';
import { ForYouPage } from './components/ForYouPage.tsx';
import { WatchlistPage } from './components/WatchlistPage.tsx';
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
import { QuestionMarkCircleIcon } from './components/icons.tsx';
import { MobileNavigation } from './components/MobileNavigation.tsx';

import * as mediaService from './services/mediaService.ts';
import { popularStudios } from './services/studioService.ts';
import { brands } from './services/brandService.ts';
import { supportedProviders } from './services/streamingService.ts';
import { popularNetworks } from './services/networkService.ts';
import { people } from './services/peopleService.ts';

import type { MediaDetails, CollectionDetails, Collection, ActorDetails, Brand, Person, Studio, Network, StreamingProviderInfo, UserLocation, ViewingGuide } from './types.ts';
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
    const [brandGuides, setBrandGuides] = useState<ViewingGuide[]>([]);
    const [isGuideLoading, setIsGuideLoading] = useState(false);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

    useEffect(() => {
      const handleHashChange = () => setRoute(getHashRoute());
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [trending, popularMovies, popularTv, nowPlaying] = await Promise.all([
                mediaService.getTrending(),
                mediaService.getPopularMovies(),
                mediaService.getPopularTv(),
                mediaService.getNowPlayingMovies(),
            ]);
            setTrending(trending);
            setPopularMovies(popularMovies);
            setPopularTv(popularTv);
            setNowPlaying(nowPlaying);
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isInitialized && tmdbApiKey && currentUser) {
            fetchInitialData();
             // Fetch user location
            fetch('https://ipinfo.io/json?token=a0c105b32a98f7')
                .then(res => res.json())
                .then(data => setUserLocation({ name: data.country, code: data.country }))
                .catch(() => setUserLocation({ name: 'United States', code: 'US' })); // Fallback
        }
    }, [isInitialized, tmdbApiKey, fetchInitialData, currentUser]);

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

    const renderPage = () => {
        const page = route[0] || 'home';

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
            case 'watchlist': return <WatchlistPage onSelectMedia={handleSelectMedia} />;
            case 'movies': return <RecommendationGrid recommendations={moviesContent} onSelect={handleSelectMedia} />;
            case 'tv': return <RecommendationGrid recommendations={tvContent} onSelect={handleSelectMedia} />;
            case 'collections': return <ComingSoonPage media={comingSoonContent} onSelectMedia={handleSelectMedia} />;
            case 'people': return <PersonGrid people={people} onSelect={(p) => window.location.hash = `/person/${p.id}`} />;
            case 'studios': return <StudioGrid studios={popularStudios} onSelect={(s) => window.location.hash = `/studio/${s.id}`} />;
            case 'brands': return <BrandGrid brands={brands} onSelect={openBrandDetail} />;
            case 'streaming': return <StreamingGrid providers={supportedProviders} onSelect={(p) => window.location.hash = `/streaming/${p.key}`} />;
            case 'networks': return <NetworkGrid networks={popularNetworks} onSelect={(n) => window.location.hash = `/network/${n.id}`} />;
            case 'game': return <GamePage />;
            case 'search': return <RecommendationGrid recommendations={searchResults} onSelect={handleSelectMedia} />;
            
            case 'studio':
            case 'network':
            case 'streaming':
            case 'person':
                 return <RecommendationGrid recommendations={studioContent} onSelect={handleSelectMedia} />; // Using studioContent for all these for simplicity
            
            case 'brand': 
                if (selectedBrand) return <BrandDetail brand={selectedBrand} media={brandContent} onBack={() => window.location.hash = '/brands'} onSelectMedia={handleSelectMedia} onSelectCollection={handleSelectCollection} mediaTypeFilter='all' setMediaTypeFilter={()=>{}} sortBy='trending' setSortBy={()=>{}} />;
                return <p>Brand not found.</p>;

            default: return <p>Page not found</p>;
        }
    };

    useEffect(() => {
        const page = route[0] || 'home';
        const id = route[1];
        
        const fetchDataForPage = async () => {
            if (!tmdbApiKey || !currentUser) return;
            setIsLoading(true);
            try {
                switch(page) {
                    case 'movies': setMoviesContent(await mediaService.getPopularMovies()); break;
                    case 'tv': setTvContent(await mediaService.getPopularTv()); break;
                    case 'collections': setComingSoonContent(await mediaService.getComingSoonMedia()); break;
                    case 'studio': setStudioContent(await mediaService.getMediaByStudio(Number(id))); break;
                    case 'network': setStudioContent(await mediaService.getMediaByNetwork(Number(id))); break;
                    case 'streaming': setStudioContent(await mediaService.getMediaByStreamingProvider(id as any, userLocation?.code || 'US')); break;
                    case 'person': setStudioContent(await mediaService.getMediaByPerson(Number(people.find(p => p.id === id)?.tmdbId), people.find(p => p.id === id)?.role || 'actor')); break;
                    case 'brand':
                      const brand = brands.find(b => b.id === id);
                      if (brand) {
                        setSelectedBrand(brand);
                        let media: MediaDetails[] = [];
                        if (brand.mediaIds) media = await mediaService.fetchMediaByIds(brand.mediaIds);
                        if (brand.collectionIds) {
                            const collectionMedia = await mediaService.fetchMediaByCollectionIds(brand.collectionIds);
                            media.push(...collectionMedia.filter(cm => !media.some(m => m.id === cm.id)));
                        }
                        if (brand.companyId) {
                           // This logic might be expanded if needed
                        }
                        setBrandContent(media);
                      }
                      break;
                }
            } catch (e) {
                console.error("Failed to load page data:", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDataForPage();
    }, [route, tmdbApiKey, userLocation, currentUser]);
    
    return (
      <>
        <main className="min-h-screen text-white relative">
          <div className="absolute inset-0 -z-20 h-[600px] bg-gradient-to-b from-[#18181b] via-transparent to-transparent" />
          <div className="absolute inset-0 -z-30 bg-[#0c0c0e]" />
          <header className="fixed top-0 left-0 right-0 z-50 p-4 transition-all duration-300">
            <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                 <h1 className="text-2xl font-bold">ScreenScape</h1>
              </div>
              <div className="hidden md:flex flex-1 justify-center">
                 <Navigation activeTab={route[0] as any || 'home'} />
              </div>
              <div className="flex justify-end items-center gap-2 sm:gap-4">
                  <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                   <button onClick={() => setIsAiSearchOpen(true)} className="p-2 glass-panel rounded-full hover:bg-white/5 transition-colors" aria-label="AI Search">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-400"><path d="M10 3.5a1.5 1.5 0 0 1 3 0V5h-3V3.5ZM10 5.5a1.5 1.5 0 0 1 3 0V7h-3V5.5ZM10 7.5a1.5 1.5 0 0 1 3 0V9h-3V7.5ZM10 9.5a1.5 1.5 0 0 1 3 0v.5h-3v-.5ZM13.5 10a1.5 1.5 0 0 0 0 3h.5v-3h-.5ZM11.5 10a1.5 1.5 0 0 0 0 3h.5v-3h-.5ZM9.5 10a1.5 1.5 0 0 0 0 3h.5v-3h-.5ZM7.5 10a1.5 1.5 0 0 0 0 3h.5v-3h-.5ZM10 13.5a1.5 1.5 0 0 1-3 0V12h3v1.5ZM10 14.5a1.5 1.5 0 0 1-3 0V13h3v1.5ZM10 16.5a1.5 1.5 0 0 1-3 0V15h3v1.5ZM10 17.5a1.5 1.5 0 0 1-3 0v-.5h3v.5ZM6.5 10a1.5 1.5 0 0 0 0-3h-.5v3h.5ZM8.5 10a1.5 1.5 0 0 0 0-3h-.5v3h.5Z" /><path fillRule="evenodd" d="M5 10a5 5 0 1 1 10 0 5 5 0 0 1-10 0Zm5-7a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z" clipRule="evenodd" /></svg>
                  </button>
                  <button onClick={() => setIsAppGuideOpen(true)} className="p-2 glass-panel rounded-full hover:bg-white/5 transition-colors" aria-label="Open App Guide">
                        <QuestionMarkCircleIcon className="w-6 h-6 text-gray-300" />
                  </button>
                  <AccountButton userLocation={userLocation} />
              </div>
            </div>
          </header>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-24">
            {renderPage()}
          </div>
        </main>
        
        {selectedItem && (
          <div className="fixed inset-0 z-[60] bg-[#0c0c0e]/80 backdrop-blur-lg overflow-y-auto" onClick={handleCloseModal}>
              <div className="container mx-auto px-4 sm:px-6 lg:px-8" onClick={e => e.stopPropagation()}>
                <DetailModal 
                    item={selectedItem}
                    onClose={handleCloseModal}
                    isLoading={isDetailLoading}
                    onSelectMedia={handleSelectMedia}
                    onSelectActor={handleSelectActor}
                    userLocation={userLocation}
                />
              </div>
          </div>
        )}

        {selectedActor && (
             <div className="fixed inset-0 z-[60] bg-[#0c0c0e]/80 backdrop-blur-lg overflow-y-auto" onClick={handleCloseModal}>
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12" onClick={e => e.stopPropagation()}>
                 <ActorPage actor={selectedActor} onBack={handleCloseModal} onSelectMedia={handleSelectMedia} />
              </div>
          </div>
        )}
        
        <AiSearchModal isOpen={isAiSearchOpen} onClose={() => setIsAiSearchOpen(false)} onSelectMedia={handleSelectMedia} />

        <GuideModal isOpen={isAppGuideOpen} onClose={() => setIsAppGuideOpen(false)} />

        {selectedBrand && (
            <ViewingGuideModal
                isOpen={isViewingGuideModalOpen}
                onClose={() => setIsViewingGuideModalOpen(false)}
                brandName={selectedBrand.name}
                guides={brandGuides}
                isLoading={isGuideLoading}
                onSelectMedia={handleSelectMedia}
            />
        )}
        <MobileNavigation activeTab={route[0] as any || 'home'} onSearchClick={() => setIsAiSearchOpen(true)} />
      </>
    );
};

export default App;
      