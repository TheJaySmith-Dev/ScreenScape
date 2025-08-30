
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

  // Main routing effect
  useEffect(() => {
    const handleRouteChange = async () => {
      // Clear all page-specific content to avoid showing stale data from previous view
      setSelectedItem(null);
      setSelectedActor(null);
      setSelectedStudio(null);
      setSelectedBrand(null);
      setSelectedProvider(null);
      setSelectedNetwork(null);
      setRecommendations([]);
      setError(null);
      
      const hash = window.location.hash.substring(1); // remove '#'
      const parts = hash.split('/').filter(Boolean);
      const [page, ...params] = parts;

      const mainTabs: ActiveTab[] = ['home', 'foryou', 'watchlist', 'movies', 'tv', 'collections', 'studios', 'brands', 'streaming', 'networks'];
      const currentTab = mainTabs.includes(page as ActiveTab) ? (page as ActiveTab) : 'home';
      setActiveTab(currentTab);

      // Don't load content if VPN is blocked or no API key
      if (!hasApiKey || isVpnBlocked) {
        if(isVpnBlocked === false) setIsLoading(false);
        return;
      }
      
      setIsLoading(true);

      try {
        switch (page) {
          case 'media': {
            const [type, idStr] = params;
            if ((type === 'movie' || type === 'tv') && idStr) {
              await handleSelectMedia(parseInt(idStr, 10), type);
            }
            break;
          }
          case 'collection': {
            const [idStr] = params;
            if (idStr) await handleSelectCollection(parseInt(idStr, 10));
            break;
          }
          case 'actor': {
            const [idStr] = params;
            if (idStr) await handleSelectActor(parseInt(idStr, 10));
            break;
          }
          case 'studios': {
            const [idStr] = params;
            const studio = studios.find(s => s.id === parseInt(idStr));
            if (studio) await handleSelectStudio(studio);
            break;
          }
          case 'brands': {
            const [idStr] = params;
            const brand = brands.find(b => b.id === idStr);
            if (brand) await handleSelectBrand(brand);
            break;
          }
          case 'streaming': {
            const [key] = params;
            const provider = availableProviders.find(p => p.key === key);
            if (provider) await handleSelectProvider(provider);
            break;
          }
          case 'networks': {
            const [idStr] = params;
            const network = networks.find(n => n.id === parseInt(idStr));
            if (network) await handleSelectNetwork(network);
            break;
          }
          case 'home':
          case 'movies':
          case 'tv':
          default: { // Also handles empty hash
            if (isVpnBlocked === false) {
                setIsHomeLoading(true);
                setError(null);
                try {
                  const [trending, popularMovies, popularTv, nowPlayingMovies, topRatedMovies, topRatedTv] = await Promise.all([
                    getTrending(), getPopularMovies(), getPopularTv(), getNowPlayingMovies(), getTopRatedMovies(), getTopRatedTv(),
                  ]);
                  const sections = [
                    { title: 'Trending This Week', items: trending, type: 'mixed' as const },
                    { title: 'Popular Movies', items: popularMovies, type: 'movie' as const },
                    { title: 'Critically Acclaimed Movies', items: topRatedMovies, type: 'movie' as const },
                    { title: 'Popular TV Shows', items: popularTv, type: 'tv' as const },
                    { title: 'Critically Acclaimed TV Shows', items: topRatedTv, type: 'tv' as const },
                    { title: 'Now Playing in Theaters', items: nowPlayingMovies, type: 'movie' as const },
                  ];
                  setHomeSections(sections.filter(s => s.items.length > 0));
                } catch (err) {
                  console.error("Failed to load home data:", err);
                  setError("Could not load content. Please try again later.");
                } finally {
                  setIsHomeLoading(false);
                }
            }
            break;
          }
          case 'collections': {
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
              break;
          }
        }
      } catch (err) {
          console.error("Routing error:", err);
          setError("An error occurred. Please try again.");
      } finally {
          setIsLoading(false);
      }
    };

    window.addEventListener('hashchange', handleRouteChange, false);
    handleRouteChange(); // initial load

    return () => window.removeEventListener('hashchange', handleRouteChange, false);
  }, [hasApiKey, isVpnBlocked, userLocation]); // Re-run if key/VPN status changes.


  const handleSearch = useCallback(async (query: string) => {
    if (!query) return;

    window.location.hash = '#/home'; // Navigate to home to show search results
    setIsLoading(true);
    setError(null);
    setRecommendations([]);

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

  const handleSelectMedia = useCallback(async (id: number, type: 'movie' | 'tv') => {
    // Set a minimal object first for faster perceived load
    setSelectedItem({ id, type, title: 'Loading...', posterUrl: '', backdropUrl: '', overview: '', rating: 0, releaseYear: '', trailerUrl: null });
    setIsModalLoading(true);
  
    try {
      const details = await fetchDetailsForModal(id, type, userLocation?.code || 'US');
      setSelectedItem(current => 
        // FIX: Added 'type' in current as a type guard to ensure `current` is MediaDetails before accessing `title`.
        current && 'type' in current && current.id === id
          ? { ...current, ...details, title: details.title || current.title } 
          : current
      );
    } catch (err) {
      console.error("Failed to fetch additional details for modal:", err);
      setError("Failed to load details for this item.");
    } finally {
      setIsModalLoading(false);
    }
  }, [userLocation]);
  
  const navigateToMedia = (media: MediaDetails) => {
    window.location.hash = `#/media/${media.type}/${media.id}`;
  };
  
  const handleSelectCollection = useCallback(async (id: number) => {
    setSelectedItem({ id, name: 'Loading...', posterUrl: '', backdropUrl: '', overview: '', parts: [] });
    setIsModalLoading(true);
    try {
        const details = await fetchCollectionDetails(id);
        setSelectedItem(details);
    } catch(err) {
        console.error("Failed to fetch collection details:", err);
        setError("Failed to load collection details.");
    } finally {
        setIsModalLoading(false);
    }
  }, []);

  const navigateToCollection = (collection: Collection) => {
    window.location.hash = `#/collection/${collection.id}`;
  };

  const handleSelectStudio = useCallback(async (studio: Studio) => {
    setSelectedStudio(studio);
    setStudioMedia([]);
    setStudioMediaTypeFilter('all');
    setStudioSortBy('trending');
    try {
        const media = await getMediaByStudio(studio.id);
        setStudioMedia(media);
    } catch (err) {
        console.error(`Failed to load media for ${studio.name}:`, err);
        setError(`Could not load media for ${studio.name}.`);
    }
  }, []);

  const displayedStudioMedia = useMemo(() => {
    let filtered = [...studioMedia];
    if (studioMediaTypeFilter !== 'all') {
        filtered = filtered.filter(media => {
            if (studioMediaTypeFilter === 'movie') return media.type === 'movie' && media.mediaSubType !== 'short';
            if (studioMediaTypeFilter === 'show') return media.type === 'tv';
            if (studioMediaTypeFilter === 'short') return media.mediaSubType === 'short';
            return true;
        });
    }
    if (studioSortBy === 'newest') {
        filtered.sort((a, b) => (new Date(b.releaseDate || 0).getTime()) - (new Date(a.releaseDate || 0).getTime()));
    } else {
         filtered.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    }
    return filtered;
  }, [studioMedia, studioMediaTypeFilter, studioSortBy]);
  
  const handleSelectBrand = useCallback(async (brand: Brand) => {
    setSelectedBrand(brand);
    setBrandMedia([]);
    setBrandMediaTypeFilter('all');
    setBrandSortBy('trending');
    try {
        const media = await getMediaByStudio(brand.companyId);
        setBrandMedia(media);
    } catch (err) {
        console.error(`Failed to load media for ${brand.name}:`, err);
        setError(`Could not load media for ${brand.name}.`);
    }
  }, []);

  const displayedBrandMedia = useMemo(() => {
    let filtered = [...brandMedia];
    if (brandMediaTypeFilter !== 'all') {
        filtered = filtered.filter(media => {
            if (brandMediaTypeFilter === 'movie') return media.type === 'movie' && media.mediaSubType !== 'short';
            if (brandMediaTypeFilter === 'show') return media.type === 'tv';
            if (brandMediaTypeFilter === 'short') return media.mediaSubType === 'short';
            return true;
        });
    }
    if (brandSortBy === 'newest') {
        filtered.sort((a, b) => (new Date(b.releaseDate || 0).getTime()) - (new Date(a.releaseDate || 0).getTime()));
    } else {
         filtered.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    }
    return filtered;
  }, [brandMedia, brandMediaTypeFilter, brandSortBy]);
  
  const handleSelectProvider = useCallback(async (provider: StreamingProviderInfo) => {
    setSelectedProvider(provider);
    setProviderMedia([]);
    setIsProviderMediaLoading(true);
    try {
        const media = await getMediaByStreamingProvider(provider.key, userLocation?.code || 'US');
        setProviderMedia(media);
        if (media.length === 0) {
            setError(`Could not find popular content for ${provider.name} in your region (${userLocation?.name || 'US'}).`);
        }
    } catch (err) {
        console.error(`Failed to load data for ${provider.name}:`, err);
        setError(`Could not load content for ${provider.name}.`);
    } finally {
        setIsProviderMediaLoading(false);
    }
  }, [userLocation]);

  const handleSelectNetwork = useCallback(async (network: Network) => {
    setSelectedNetwork(network);
    setNetworkMedia([]);
    try {
        const media = await getMediaByNetwork(network.id);
        setNetworkMedia(media);
    } catch (err) {
        console.error(`Failed to load media for ${network.name}:`, err);
        setError(`Could not load media for ${network.name}.`);
    }
  }, []);

  const handleSelectActor = useCallback(async (actorId: number) => {
    try {
        const actorDetails = await fetchActorDetails(actorId);
        setSelectedActor(actorDetails);
    } catch (err) {
        console.error(`Failed to load details for actor ${actorId}:`, err);
        setError(`Could not load actor details.`);
    }
  }, []);
  
  const handleBack = () => {
    window.history.back();
  };

  const handleApiKeySaved = () => {
    setHasApiKey(true);
    setIsApiKeyModalOpen(false);
  };

  const renderHomePageContent = () => {
    if (isLoading && !selectedStudio && !selectedBrand && !selectedProvider && !selectedNetwork) return <LoadingSpinner />;
    if (error && recommendations.length === 0 && !selectedStudio && !selectedBrand && !selectedProvider && !selectedNetwork) {
        return <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>;
    }
    
    if (recommendations.length > 0) {
      return <RecommendationGrid recommendations={recommendations} onSelect={navigateToMedia} />;
    }

    if (selectedStudio) {
      return (
        <div className="w-full max-w-7xl">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => window.location.hash = '#/studios'} className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors">&larr; Back to Studios</button>
                <h2 className="text-3xl font-bold">{selectedStudio.name}</h2>
            </div>
            <StudioFilters
              mediaTypeFilter={studioMediaTypeFilter}
              setMediaTypeFilter={setStudioMediaTypeFilter}
              sortBy={studioSortBy}
              setSortBy={setStudioSortBy}
            />
            {isLoading ? <LoadingSpinner /> : <RecommendationGrid recommendations={displayedStudioMedia} onSelect={navigateToMedia} />}
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
            onBack={() => window.location.hash = '#/brands'}
            onSelectMedia={navigateToMedia}
            onSelectCollection={navigateToCollection}
        />;
    }

    if (selectedProvider) {
      return (
        <div className="w-full max-w-7xl">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => window.location.hash = '#/streaming'} className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors">&larr; Back to Services</button>
            <h2 className="text-3xl font-bold">{selectedProvider.name}</h2>
          </div>
          {isProviderMediaLoading ? <LoadingSpinner /> : <RecommendationGrid recommendations={providerMedia} onSelect={navigateToMedia} />}
        </div>
      );
    }

    if (selectedNetwork) {
      return (
        <div className="w-full max-w-7xl">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => window.location.hash = '#/networks'} className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors">&larr; Back to Networks</button>
            <h2 className="text-3xl font-bold">{selectedNetwork.name}</h2>
          </div>
          {isLoading ? <LoadingSpinner /> : <RecommendationGrid recommendations={networkMedia} onSelect={navigateToMedia} />}
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
                    onSelect={navigateToMedia}
                    animationDelay={`${index * 150}ms`}
                />
            ))}
          </div>
        );
      }
      case 'collections':
        if (isComingSoonLoading) return <LoadingSpinner />;
        return <ComingSoonPage media={comingSoonMedia} onSelectMedia={navigateToMedia} />;
      case 'studios':
        return <StudioGrid studios={studios} onSelect={(studio) => window.location.hash = `#/studios/${studio.id}`} />;
      case 'brands':
        return <BrandGrid brands={brands} onSelect={(brand) => window.location.hash = `#/brands/${brand.id}`} />;
      case 'foryou':
        return <ForYouPage onSelectMedia={navigateToMedia} />;
      case 'streaming':
        return <StreamingGrid providers={availableProviders} onSelect={(provider) => window.location.hash = `#/streaming/${provider.key}`} />;
      case 'networks':
        return <NetworkGrid networks={networks} onSelect={(network) => window.location.hash = `#/networks/${network.id}`} />;
      case 'watchlist':
        return <WatchlistPage onSelectMedia={navigateToMedia} />;
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
                  onClose={handleBack} 
                  isLoading={isModalLoading}
                  onSelectMedia={(media) => window.location.hash = `#/media/${media.type}/${media.id}`}
                  onSelectActor={(actorId) => window.location.hash = `#/actor/${actorId}`}
                  userLocation={userLocation}
                />
            </main>
        ) : selectedActor ? (
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ActorPage
                    actor={selectedActor}
                    onBack={handleBack}
                    onSelectMedia={navigateToMedia}
                />
            </main>
        ) : (
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <svg className="w-10 h-10 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 4h-4l-4-4-4 4H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H4V6h4.52l4-4 4 4H20v14zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                        <a href="#/home" className="text-2xl sm:text-3xl font-bold tracking-tight">WatchNow</a>
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
                    <Navigation activeTab={activeTab} />
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
