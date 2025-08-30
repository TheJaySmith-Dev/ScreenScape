import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { SearchBar } from './components/SearchBar.tsx';
import { RecommendationGrid } from './components/RecommendationGrid.tsx';
import { LoadingSpinner } from './components/LoadingSpinner.tsx';
import { MediaRow } from './components/MediaRow.tsx';
import { Navigation } from './components/Navigation.tsx';
import { 
  fetchDetailsForModal,
  fetchCollectionDetails,
  getTrending,
  getPopularMovies,
  getPopularTv,
  getNowPlayingMovies,
  getTopRatedMovies,
  getTopRatedTv,
  getMediaByStudio,
  searchTmdb,
  getMediaByStreamingProvider,
  getMediaByNetwork,
  fetchActorDetails,
  getComingSoonMedia,
} from './services/tmdbService.ts';
import type { MediaDetails, Collection, CollectionDetails, UserLocation, Studio, Brand, StreamingProviderInfo, Network, ActorDetails } from './types.ts';
import { popularStudios } from './services/studioService.ts';
import { brands as allBrands } from './services/brandService.ts';
import { DetailModal } from './components/DetailModal.tsx';
import { StudioGrid } from './components/StudioGrid.tsx';
import { StudioFilters } from './components/StudioFilters.tsx';
import { BrandGrid } from './components/BrandGrid.tsx';
import { BrandDetail } from './components/BrandDetail.tsx';
import { AccountButton } from './components/AccountButton.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ForYouPage } from './components/ForYouPage.tsx';
import { supportedProviders } from './services/streamingService.ts';
import { StreamingGrid } from './components/StreamingGrid.tsx';
import { popularNetworks } from './services/networkService.ts';
import { NetworkGrid } from './components/NetworkGrid.tsx';
import { ActorPage } from './components/ActorPage.tsx';
import { WatchlistPage } from './components/WatchlistPage.tsx';
import { ComingSoonPage } from './components/ComingSoonPage.tsx';
import { ApiKeyModal } from './components/ApiKeyModal.tsx';
import { getTmdbApiKey } from './services/apiService.ts';


type ActiveTab = 'home' | 'foryou' | 'watchlist' | 'movies' | 'tv' | 'collections' | 'studios' | 'brands' | 'streaming' | 'networks';
type MediaTypeFilter = 'all' | 'movie' | 'show' | 'short';
type SortBy = 'trending' | 'newest';


const App: React.FC = () => {
  const [recommendations, setRecommendations] = useState<MediaDetails[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaDetails | CollectionDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [homeSections, setHomeSections] = useState<{title: string, items: MediaDetails[], type: 'movie' | 'tv' | 'mixed'}[]>([]);
  const [isHomeLoading, setIsHomeLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isVpnBlocked, setIsVpnBlocked] = useState<boolean | null>(null); // null: checking, false: ok, true: blocked
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // State for API Key onboarding
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // State for Streaming hubs
  const [availableProviders, setAvailableProviders] = useState<StreamingProviderInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<StreamingProviderInfo | null>(null);
  const [providerMedia, setProviderMedia] = useState<MediaDetails[]>([]);
  const [isProviderMediaLoading, setIsProviderMediaLoading] = useState<boolean>(false);


  const [studios] = useState<Studio[]>(popularStudios);
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null);
  const [studioMedia, setStudioMedia] = useState<MediaDetails[]>([]);
  const [studioMediaTypeFilter, setStudioMediaTypeFilter] = useState<MediaTypeFilter>('all');
  const [studioSortBy, setStudioSortBy] = useState<SortBy>('trending');

  const [brands] = useState<Brand[]>(allBrands);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brandMedia, setBrandMedia] = useState<MediaDetails[]>([]);
  const [brandMediaTypeFilter, setBrandMediaTypeFilter] = useState<MediaTypeFilter>('all');
  const [brandSortBy, setBrandSortBy] = useState<SortBy>('trending');

  // State for Networks hub
  const [networks] = useState<Network[]>(popularNetworks);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [networkMedia, setNetworkMedia] = useState<MediaDetails[]>([]);

  // State for Actor pages
  const [selectedActor, setSelectedActor] = useState<ActorDetails | null>(null);

  // State for Coming Soon page
  const [comingSoonMedia, setComingSoonMedia] = useState<MediaDetails[]>([]);
  const [isComingSoonLoading, setIsComingSoonLoading] = useState(true);

  // Initial app setup for API Key
  useEffect(() => {
    const key = getTmdbApiKey();
    if (key) {
        setHasApiKey(true);
    } else {
        setHasApiKey(false);
        setIsApiKeyModalOpen(true);
    }
  }, []);

  useEffect(() => {
    const initApp = async () => {
      setIsVpnBlocked(null);
      setUserLocation(null);
      try {
        const response = await fetch(`https://ipinfo.io/json?token=3a0f3ae3fa17bb&_=${new Date().getTime()}`);
        if (!response.ok) throw new Error('VPN check service returned an error.');
        const data = await response.json();

        let loc: UserLocation = { name: 'United States', code: 'US' };
        if (data.country) {
          try {
            const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(data.country);
            loc = { name: countryName ?? data.country, code: data.country };
          } catch (e) {
            loc = { name: data.country, code: data.country };
          }
        }
        setUserLocation(loc);

        if (data.privacy?.vpn === true) {
          setIsVpnBlocked(true);
        } else {
          setIsVpnBlocked(false);
          setAvailableProviders(supportedProviders);
        }
      } catch (error) {
        console.error('Error checking for VPN/location:', error);
        setIsVpnBlocked(false);
        const defaultLoc = { name: 'United States', code: 'US' };
        setUserLocation(defaultLoc);
        // Fallback to showing curated providers on error
        setAvailableProviders(supportedProviders);
      }
    };

    if (hasApiKey) {
        initApp();
    }
  }, [hasApiKey]);


  // Effect for loading primary content based on tab.
  useEffect(() => {
    if (isVpnBlocked !== false || !hasApiKey) return;

    const loadHomeAndSharedData = async () => {
      setIsHomeLoading(true);
      setError(null);
      try {
        const [
          trending, 
          popularMovies, 
          popularTv, 
          nowPlayingMovies,
          topRatedMovies,
          topRatedTv,
        ] = await Promise.all([
          getTrending(),
          getPopularMovies(),
          getPopularTv(),
          getNowPlayingMovies(),
          getTopRatedMovies(),
          getTopRatedTv(),
        ]);
        
        const sections = [];
        if (trending.length > 0) sections.push({ title: 'Trending This Week', items: trending, type: 'mixed' as const });
        if (popularMovies.length > 0) sections.push({ title: 'Popular Movies', items: popularMovies, type: 'movie' as const });
        if (topRatedMovies.length > 0) sections.push({ title: 'Critically Acclaimed Movies', items: topRatedMovies, type: 'movie' as const });
        if (popularTv.length > 0) sections.push({ title: 'Popular TV Shows', items: popularTv, type: 'tv' as const });
        if (topRatedTv.length > 0) sections.push({ title: 'Critically Acclaimed TV Shows', items: topRatedTv, type: 'tv' as const });
        if (nowPlayingMovies.length > 0) sections.push({ title: 'Now Playing in Theaters', items: nowPlayingMovies, type: 'movie' as const });
        setHomeSections(sections);
      } catch (err) {
        console.error("Failed to load home data:", err);
        setError("Could not load content. Please try again later.");
      } finally {
        setIsHomeLoading(false);
      }
    };

    const loadComingSoonData = async () => {
        setIsComingSoonLoading(true);
        setError(null);
        try {
            const media = await getComingSoonMedia();
            setComingSoonMedia(media);
        } catch (err) {
            console.error("Failed to load coming soon data:", err);
            setError("Could not load upcoming content. Please try again later.");
        } finally {
            setIsComingSoonLoading(false);
        }
    };
    
    // Router-like logic to fetch data for the active tab
    if (['home', 'movies', 'tv'].includes(activeTab)) {
        loadHomeAndSharedData();
    } else if (activeTab === 'collections') {
        loadComingSoonData();
    }
  }, [activeTab, isVpnBlocked, hasApiKey]);


  const handleSearch = useCallback(async (query: string) => {
    if (!query) return;

    setIsLoading(true);
    setError(null);
    setRecommendations([]);
    setSelectedItem(null);
    setSelectedActor(null);
    setActiveTab('home');

    try {
      const searchResults = await searchTmdb(query);
      if (!searchResults || searchResults.length === 0) {
        setError(`No results found for "${query}".`);
      } else {
        setRecommendations(searchResults);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(errorMessage);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectMedia = useCallback(async (media: MediaDetails) => {
    setSelectedActor(null);
    setSelectedItem(media);
    setIsModalLoading(true);
  
    try {
      const details = await fetchDetailsForModal(media.id, media.type, userLocation?.code || 'US');
      setSelectedItem(currentMedia => 
        currentMedia && 'id' in currentMedia && currentMedia.id === media.id
          ? { ...currentMedia, ...details } 
          : currentMedia
      );
    } catch (err) {
      console.error("Failed to fetch additional details for modal:", err);
    } finally {
      setIsModalLoading(false);
    }
  }, [userLocation]);

  const handleSelectCollection = useCallback(async (collection: Collection) => {
    setSelectedActor(null);
    setSelectedItem({ ...collection, overview: '', parts: [] });
    setIsModalLoading(true);
    try {
        const details = await fetchCollectionDetails(collection.id);
        setSelectedItem(details);
    } catch(err) {
        console.error("Failed to fetch collection details:", err);
        // Fallback to basic info if details fail
        setSelectedItem({ ...collection, overview: 'Failed to fetch collection details.', parts: [] });
    } finally {
        setIsModalLoading(false);
    }
  }, []);

  const handleSelectStudio = useCallback(async (studio: Studio) => {
    setIsLoading(true);
    setSelectedActor(null);
    setSelectedStudio(studio);
    setStudioMedia([]);
    setError(null);
    setStudioMediaTypeFilter('all');
    setStudioSortBy('trending');
    try {
        const media = await getMediaByStudio(studio.id);
        setStudioMedia(media);
    } catch (err) {
        console.error(`Failed to load media for ${studio.name}:`, err);
        setError(`Could not load media for ${studio.name}. Please try again later.`);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const displayedStudioMedia = useMemo(() => {
    let filtered = [...studioMedia];

    // Apply media type filter
    if (studioMediaTypeFilter !== 'all') {
        filtered = filtered.filter(media => {
            if (studioMediaTypeFilter === 'movie') {
                return media.type === 'movie' && media.mediaSubType !== 'short';
            }
            if (studioMediaTypeFilter === 'show') {
                return media.type === 'tv';
            }
            if (studioMediaTypeFilter === 'short') {
                return media.mediaSubType === 'short';
            }
            return true;
        });
    }
    
    // Apply sort
    if (studioSortBy === 'newest') {
        filtered.sort((a, b) => {
            const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
            const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
            return dateB - dateA;
        });
    } else { // 'trending' is the default sort from the API, but we re-sort to be safe
         filtered.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    }

    return filtered;
  }, [studioMedia, studioMediaTypeFilter, studioSortBy]);

  const handleBackToStudios = () => {
    setSelectedStudio(null);
    setStudioMedia([]);
    setError(null);
  };
  
  const handleSelectBrand = useCallback(async (brand: Brand) => {
    setIsLoading(true);
    setSelectedActor(null);
    setSelectedBrand(brand);
    setBrandMedia([]);
    setError(null);
    setBrandMediaTypeFilter('all');
    setBrandSortBy('trending');
    try {
        const media = await getMediaByStudio(brand.companyId);
        setBrandMedia(media);
    } catch (err) {
        console.error(`Failed to load media for ${brand.name}:`, err);
        setError(`Could not load media for ${brand.name}. Please try again later.`);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const displayedBrandMedia = useMemo(() => {
    let filtered = [...brandMedia];

    if (brandMediaTypeFilter !== 'all') {
        filtered = filtered.filter(media => {
            if (brandMediaTypeFilter === 'movie') {
                return media.type === 'movie' && media.mediaSubType !== 'short';
            }
            if (brandMediaTypeFilter === 'show') {
                return media.type === 'tv';
            }
            if (brandMediaTypeFilter === 'short') {
                return media.mediaSubType === 'short';
            }
            return true;
        });
    }
    
    if (brandSortBy === 'newest') {
        filtered.sort((a, b) => {
            const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
            const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
            return dateB - dateA;
        });
    } else {
         filtered.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    }

    return filtered;
  }, [brandMedia, brandMediaTypeFilter, brandSortBy]);

  const handleBackToBrands = () => {
    setSelectedBrand(null);
    setBrandMedia([]);
    setError(null);
  };
  
  const handleSelectProvider = useCallback(async (provider: StreamingProviderInfo) => {
    setSelectedActor(null);
    setSelectedProvider(provider);
    setProviderMedia([]);
    setError(null);

    setIsProviderMediaLoading(true);
    try {
        const media = await getMediaByStreamingProvider(provider.key, userLocation?.code || 'US');

        setProviderMedia(media);
        if (media.length === 0) {
            setError(`Could not find popular content for ${provider.name} in your region (${userLocation?.name || 'US'}).`);
        }
    } catch (err) {
        console.error(`Failed to load data for ${provider.name}:`, err);
        setError(`Could not load content for ${provider.name}. Please try again later.`);
    } finally {
        setIsProviderMediaLoading(false);
    }
  }, [userLocation]);

  const handleBackToStreaming = () => {
    setSelectedProvider(null);
    setProviderMedia([]);
    setError(null);
  };

  const handleSelectNetwork = useCallback(async (network: Network) => {
    setIsLoading(true);
    setSelectedActor(null);
    setSelectedNetwork(network);
    setNetworkMedia([]);
    setError(null);
    try {
        const media = await getMediaByNetwork(network.id);
        setNetworkMedia(media);
    } catch (err) {
        console.error(`Failed to load media for ${network.name}:`, err);
        setError(`Could not load media for ${network.name}. Please try again later.`);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleBackToNetworks = () => {
    setSelectedNetwork(null);
    setNetworkMedia([]);
    setError(null);
  };

  const handleSelectActor = useCallback(async (actorId: number) => {
    setIsLoading(true);
    setSelectedActor(null);
    setError(null);
    setSelectedItem(null); // Close current media/collection modal
    
    try {
        const actorDetails = await fetchActorDetails(actorId);
        setSelectedActor(actorDetails);
    } catch (err) {
        console.error(`Failed to load details for actor ${actorId}:`, err);
        setError(`Could not load actor details. Please try again later.`);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleBackFromActor = () => {
    setSelectedActor(null);
    setError(null);
  };

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const clearSearch = () => {
    setRecommendations([]);
    setError(null);
  }

  const handleTabChange = (tab: ActiveTab) => {
    clearSearch();
    // Reset states for other tabs to ensure fresh content on navigation
    setHomeSections([]);
    setSelectedStudio(null);
    setStudioMedia([]);
    setSelectedBrand(null);
    setBrandMedia([]);
    setSelectedProvider(null);
    setProviderMedia([]);
    setSelectedNetwork(null);
    setNetworkMedia([]);
    setSelectedActor(null);
    setComingSoonMedia([]);
    setActiveTab(tab);
  };

  const handleApiKeySaved = () => {
    setHasApiKey(true);
    setIsApiKeyModalOpen(false);
  };

  const renderHomePageContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error && recommendations.length === 0 && !selectedStudio && !selectedBrand && !selectedProvider && !selectedNetwork) {
        return <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>;
    }
    
    if (recommendations.length > 0) {
      return <RecommendationGrid recommendations={recommendations} onSelect={handleSelectMedia} />;
    }

    if (selectedStudio) {
      return (
        <div className="w-full max-w-7xl">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={handleBackToStudios} className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors">&larr; Back to Studios</button>
                <h2 className="text-3xl font-bold">{selectedStudio.name}</h2>
            </div>
            <StudioFilters
              mediaTypeFilter={studioMediaTypeFilter}
              setMediaTypeFilter={setStudioMediaTypeFilter}
              sortBy={studioSortBy}
              setSortBy={setStudioSortBy}
            />
            <RecommendationGrid recommendations={displayedStudioMedia} onSelect={handleSelectMedia} />
        </div>
      );
    }

    if (selectedBrand) {
        return <BrandDetail 
            brand={selectedBrand} 
            media={displayedBrandMedia}
            mediaTypeFilter={brandMediaTypeFilter}
            setMediaTypeFilter={setBrandMediaTypeFilter}
            sortBy={brandSortBy}
            setSortBy={setBrandSortBy}
            onBack={handleBackToBrands}
            onSelectMedia={handleSelectMedia}
            onSelectCollection={handleSelectCollection}
        />;
    }

    if (selectedProvider) {
      return (
        <div className="w-full max-w-7xl">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={handleBackToStreaming} className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors">&larr; Back to Services</button>
            <h2 className="text-3xl font-bold">{selectedProvider.name}</h2>
          </div>
          {isProviderMediaLoading ? <LoadingSpinner /> : <RecommendationGrid recommendations={providerMedia} onSelect={handleSelectMedia} />}
        </div>
      );
    }

    if (selectedNetwork) {
      return (
        <div className="w-full max-w-7xl">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={handleBackToNetworks} className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors">&larr; Back to Networks</button>
            <h2 className="text-3xl font-bold">{selectedNetwork.name}</h2>
          </div>
          <RecommendationGrid recommendations={networkMedia} onSelect={handleSelectMedia} />
        </div>
      );
    }

    switch(activeTab) {
      case 'home':
      case 'movies':
      case 'tv': {
        if (isHomeLoading) return <LoadingSpinner />;
        
        let filteredSections = homeSections;
        if (activeTab === 'movies') {
            filteredSections = homeSections.filter(s => s.type === 'movie' || s.title === 'Trending This Week');
        } else if (activeTab === 'tv') {
            filteredSections = homeSections.filter(s => s.type === 'tv' || s.title === 'Trending This Week');
        }

        return (
          <div className="w-full max-w-7xl flex flex-col gap-8 md:gap-12">
            {filteredSections.map((section, index) => (
                <MediaRow 
                    key={section.title} 
                    title={section.title} 
                    items={section.items} 
                    onSelect={handleSelectMedia}
                    animationDelay={`${index * 150}ms`}
                />
            ))}
          </div>
        );
      }
      case 'collections':
        if (isComingSoonLoading) return <LoadingSpinner />;
        return <ComingSoonPage media={comingSoonMedia} onSelectMedia={handleSelectMedia} />;
      case 'studios':
        return <StudioGrid studios={studios} onSelect={handleSelectStudio} />;
      case 'brands':
        return <BrandGrid brands={brands} onSelect={handleSelectBrand} />;
      case 'foryou':
        return <ForYouPage onSelectMedia={handleSelectMedia} />;
      case 'streaming':
        return <StreamingGrid providers={availableProviders} onSelect={handleSelectProvider} />;
      case 'networks':
        return <NetworkGrid networks={networks} onSelect={handleSelectNetwork} />;
      case 'watchlist':
        return <WatchlistPage onSelectMedia={handleSelectMedia} />;
      default:
        return <p>Welcome!</p>;
    }
  };


  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onSave={handleApiKeySaved}
        isDismissable={hasApiKey}
        onClose={() => hasApiKey && setIsApiKeyModalOpen(false)}
      />

      {hasApiKey && isVpnBlocked === true && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="max-w-md text-center bg-gray-800 p-8 rounded-2xl border border-red-500/50">
            <h2 className="text-2xl font-bold text-red-400 mb-4">VPN/Proxy Detected</h2>
            <p className="text-gray-300">
              This service is not available when using a VPN or proxy. Please disable it and refresh the page to continue.
            </p>
          </div>
        </div>
      )}
      {hasApiKey && isVpnBlocked === null && (
         <div className="fixed inset-0 bg-gray-900 z-[100] flex items-center justify-center">
            <LoadingSpinner />
         </div>
      )}
      {!hasApiKey && !isApiKeyModalOpen && (
        <div className="fixed inset-0 bg-gray-900 z-[100] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}


      {hasApiKey && (
        <>
        {selectedItem ? (
            <main className="container mx-auto px-4 sm:px-6 lg:px-8">
                <DetailModal 
                  item={selectedItem} 
                  onClose={handleCloseModal} 
                  isLoading={isModalLoading}
                  onSelectMedia={handleSelectMedia}
                  onSelectActor={handleSelectActor}
                  userLocation={userLocation}
                />
            </main>
        ) : selectedActor ? (
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ActorPage
                    actor={selectedActor}
                    onBack={handleBackFromActor}
                    onSelectMedia={handleSelectMedia}
                />
            </main>
        ) : (
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <svg className="w-10 h-10 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 4h-4l-4-4-4 4H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H4V6h4.52l4-4 4 4H20v14zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight cursor-pointer" onClick={() => handleTabChange('home')}>WatchNow</h1>
                    </div>
                    <AccountButton 
                        onSignInClick={() => setIsAuthModalOpen(true)} 
                        userLocation={userLocation} 
                        onApiKeySettingsClick={() => setIsApiKeyModalOpen(true)}
                    />
                </header>
                <div className="mb-8 flex justify-center">
                    <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                </div>
                <div className="mb-8 flex justify-center">
                    <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
                </div>
                
                <div className="flex justify-center">
                    {renderHomePageContent()}
                </div>
            </main>
        )}
        </>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default App;