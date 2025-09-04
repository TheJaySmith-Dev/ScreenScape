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
  searchMedia,
  getMediaByStreamingProvider,
  getMediaByNetwork,
  fetchActorDetails,
  getComingSoonMedia,
  fetchMediaByIds,
  fetchMediaByCollectionIds,
  getMediaByPerson,
} from './services/mediaService.ts';
import type { MediaDetails, Collection, CollectionDetails, UserLocation, Studio, Brand, StreamingProviderInfo, Network, ActorDetails, CharacterCollection, MediaTypeFilter, SortBy, Person } from './types.ts';
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
import { GitHubIcon } from './components/icons.tsx';
import { ApiKeyModal } from './components/ApiKeyModal.tsx';
import * as apiService from './services/apiService.ts';
import { GamePage } from './components/GamePage.tsx';
import { people as allPeople } from './services/peopleService.ts';
import { PersonGrid } from './components/PersonGrid.tsx';


type ActiveTab = 'home' | 'foryou' | 'watchlist' | 'movies' | 'tv' | 'collections' | 'people' | 'studios' | 'brands' | 'streaming' | 'networks' | 'game';


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
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

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

  // State for "People" hubs (Actors/Directors)
  const [people] = useState<Person[]>(allPeople);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [personMedia, setPersonMedia] = useState<MediaDetails[]>([]);

  // State for Coming Soon page
  const [comingSoonMedia, setComingSoonMedia] = useState<MediaDetails[]>([]);
  const [isComingSoonLoading, setIsComingSoonLoading] = useState(true);

  useEffect(() => {
    const key = apiService.getApiKey();
    if (key) {
      setApiKey(key);
    } else {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  const handleSaveApiKey = (newKey: string) => {
    apiService.saveApiKey(newKey);
    setApiKey(newKey);
    setIsApiKeyModalOpen(false);
  };

  useEffect(() => {
    if (!apiKey) return;

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
    initApp();
  }, [apiKey]);

  // Main routing effect
  useEffect(() => {
    if (!apiKey) return;

    const handleRouteChange = async () => {
      // Clear all page-specific content to avoid showing stale data from previous view
      setSelectedItem(null);
      setSelectedActor(null);
      setSelectedStudio(null);
      setSelectedBrand(null);
      setSelectedProvider(null);
      setSelectedNetwork(null);
      setSelectedPerson(null);
      setRecommendations([]);
      setError(null);
      
      const hash = window.location.hash.substring(1); // remove '#'
      const parts = hash.split('/').filter(Boolean);
      const [page, ...params] = parts;

      const mainTabs: ActiveTab[] = ['home', 'foryou', 'watchlist', 'movies', 'tv', 'collections', 'people', 'studios', 'brands', 'streaming', 'networks', 'game'];
      const currentTab = mainTabs.includes(page as ActiveTab) ? (page as ActiveTab) : 'home';
      setActiveTab(currentTab);

      // Don't load content if VPN is blocked
      if (isVpnBlocked) {
        setIsLoading(false);
        return;
      }
      
      if (currentTab !== 'game') {
        setIsLoading(true);
      }

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
          case 'people': {
            const [idStr] = params;
            const person = people.find(p => p.id === idStr);
            if (person) await handleSelectPerson(person);
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
                  setError("Could not load content. Please check your network connection.");
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
          case 'game':
            // The GamePage component handles its own loading state.
            break;
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
  }, [isVpnBlocked, userLocation, availableProviders, brands, apiKey]); // Re-run if VPN status or brands change.


  const handleSearch = useCallback(async (query: string) => {
    if (!query) return;

    window.location.hash = '#/home'; // Navigate to home to show search results
    setIsLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const searchResults = await searchMedia(query);
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
    setBrandSortBy(brand.defaultSort || 'trending');
    try {
        let media: MediaDetails[] = [];
        if (brand.collectionIds && brand.collectionIds.length > 0) {
            media = await fetchMediaByCollectionIds(brand.collectionIds);
        } else if (brand.mediaIds && brand.mediaIds.length > 0) {
            media = await fetchMediaByIds(brand.mediaIds);
        } else if (brand.companyId) {
            media = await getMediaByStudio(brand.companyId);
        }
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
    } else if (brandSortBy === 'timeline') {
        filtered.sort((a, b) => (new Date(a.releaseDate || 0).getTime()) - (new Date(b.releaseDate || 0).getTime()));
    } else { // 'trending'
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

  const handleSelectPerson = useCallback(async (person: Person) => {
    setSelectedPerson(person);
    setPersonMedia([]);
    try {
        const media = await getMediaByPerson(person.tmdbId, person.role);
        setPersonMedia(media);
    } catch (err) {
        console.error(`Failed to load media for ${person.name}:`, err);
        setError(`Could not load media for ${person.name}.`);
    }
  }, []);
  
  const handleBack = () => {
    if (selectedItem && 'parts' in selectedItem && selectedBrand) {
      setSelectedItem(null);
    } else {
      window.history.back();
    }
  };

  const handleBrandCollectionSelect = useCallback(async (collection: CharacterCollection) => {
    if (collection.mediaIds && collection.mediaIds.length > 0) {
      setIsModalLoading(true);
      setSelectedItem({ id: collection.id, name: collection.name, posterUrl: collection.posterUrl, backdropUrl: collection.backdropUrl, overview: 'Loading collection...', parts: [] });
      
      try {
        const media = await fetchMediaByIds(collection.mediaIds);
        const curatedDetails: CollectionDetails = {
          id: collection.id,
          name: collection.name,
          overview: `A curated collection of essential appearances for ${collection.name}.`,
          posterUrl: collection.posterUrl,
          backdropUrl: collection.backdropUrl,
          parts: media,
        };
        setSelectedItem(curatedDetails);
      } catch (err) {
        console.error('Failed to fetch curated collection details:', err);
        setError('Could not load curated collection details.');
        setSelectedItem(null);
      } finally {
        setIsModalLoading(false);
      }
    } else {
      navigateToCollection(collection);
    }
  }, []);

  const renderHomePageContent = () => {
    if (isLoading && !selectedStudio && !selectedBrand && !selectedProvider && !selectedNetwork && !selectedPerson) return <LoadingSpinner />;
    if (error && recommendations.length === 0 && !selectedStudio && !selectedBrand && !selectedProvider && !selectedNetwork && !selectedPerson) {
        return <div className="text-red-100 bg-red-500/50 glass-panel p-4 rounded-2xl">{error}</div>;
    }
    
    if (recommendations.length > 0) {
      return <RecommendationGrid recommendations={recommendations} onSelect={navigateToMedia} />;
    }

    if (selectedStudio) {
      return (
        <div className="w-full max-w-7xl text-white">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => window.location.hash = '#/studios'} className="px-4 py-2 text-sm glass-panel rounded-full hover:bg-white/20 transition-colors text-white">&larr; Back to Studios</button>
                <h2 className="text-3xl font-bold" style={{textShadow: '0 2px 5px rgba(0,0,0,0.5)'}}>{selectedStudio.name}</h2>
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
            onSelectCollection={handleBrandCollectionSelect}
        />;
    }

    if (selectedProvider) {
      return (
        <div className="w-full max-w-7xl text-white">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => window.location.hash = '#/streaming'} className="px-4 py-2 text-sm glass-panel rounded-full hover:bg-white/20 transition-colors text-white">&larr; Back to Streaming Hubs</button>
            <h2 className="text-3xl font-bold" style={{textShadow: '0 2px 5px rgba(0,0,0,0.5)'}}>{selectedProvider.name}</h2>
          </div>
          {isProviderMediaLoading ? <LoadingSpinner /> : <RecommendationGrid recommendations={providerMedia} onSelect={navigateToMedia} />}
        </div>
      );
    }

    if (selectedNetwork) {
        return (
            <div className="w-full max-w-7xl text-white">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => window.location.hash = '#/networks'} className="px-4 py-2 text-sm glass-panel rounded-full hover:bg-white/20 transition-colors text-white">&larr; Back to Networks</button>
                    <h2 className="text-3xl font-bold" style={{textShadow: '0 2px 5px rgba(0,0,0,0.5)'}}>{selectedNetwork.name}</h2>
                </div>
                {isLoading ? <LoadingSpinner /> : <RecommendationGrid recommendations={networkMedia} onSelect={navigateToMedia} />}
            </div>
        );
    }
    
    if (selectedPerson) {
        return (
            <div className="w-full max-w-7xl text-white">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => window.location.hash = '#/people'} className="px-4 py-2 text-sm glass-panel rounded-full hover:bg-white/20 transition-colors text-white">&larr; Back to Talent</button>
                    <h2 className="text-3xl font-bold" style={{textShadow: '0 2px 5px rgba(0,0,0,0.5)'}}>{selectedPerson.name}</h2>
                </div>
                {isLoading ? <LoadingSpinner /> : <RecommendationGrid recommendations={personMedia} onSelect={navigateToMedia} />}
            </div>
        );
    }
    

    if (isHomeLoading) return <LoadingSpinner />;

    return (
      <div className="flex flex-col gap-8 md:gap-12">
        {homeSections.map((section, index) => (
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
  };
  
  const renderPage = () => {
    if (selectedItem) {
      return (
        <DetailModal
          item={selectedItem}
          onClose={handleBack}
          isLoading={isModalLoading}
          onSelectMedia={navigateToMedia}
          onSelectActor={(id) => window.location.hash = `#/actor/${id}`}
          userLocation={userLocation}
        />
      );
    }

    if(selectedActor) {
        return <ActorPage actor={selectedActor} onBack={handleBack} onSelectMedia={navigateToMedia} />;
    }

    // Main Pages based on tabs
    switch(activeTab) {
      case 'studios':
        return <StudioGrid studios={studios} onSelect={(studio) => window.location.hash = `#/studios/${studio.id}`} />;
      case 'brands':
        return <BrandGrid brands={brands} onSelect={(brand) => window.location.hash = `#/brands/${brand.id}`} />;
      case 'streaming':
        return <StreamingGrid providers={availableProviders} onSelect={(p) => window.location.hash = `#/streaming/${p.key}`} />;
      case 'networks':
        return <NetworkGrid networks={networks} onSelect={(n) => window.location.hash = `#/networks/${n.id}`} />;
      case 'people':
        return <PersonGrid people={people} onSelect={(p) => window.location.hash = `#/people/${p.id}`} />;
      case 'foryou':
        return <ForYouPage onSelectMedia={navigateToMedia} />;
      case 'watchlist':
        return <WatchlistPage onSelectMedia={navigateToMedia} />;
      case 'collections':
        return isComingSoonLoading ? <LoadingSpinner/> : <ComingSoonPage media={comingSoonMedia} onSelectMedia={navigateToMedia} />
      case 'game':
        return <GamePage />;
      default:
        return renderHomePageContent();
    }
  }

  if (isVpnBlocked) {
    return (
        <div className="h-screen flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-3xl font-bold mb-4">VPN Detected</h1>
            <p className="max-w-md">To ensure content is relevant to your region, please disable your VPN and refresh the page. This helps us show you accurate streaming availability.</p>
        </div>
    );
  }

  if (isVpnBlocked === null) {
      return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center gap-8 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="#/home" className="flex items-center gap-3 no-underline">
            <img src="/favicon.svg" alt="ScreenScape Logo" className="w-10 h-10" />
            <h1 className="text-3xl font-bold text-white/90 tracking-tighter text-glow" style={{'--glow-color': 'rgba(255, 255, 255, 0.4)'} as React.CSSProperties}>ScreenScape</h1>
          </a>
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          <div className="flex items-center gap-4">
            <a href="https://github.com/google/labs-prototypes" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
                <GitHubIcon className="w-6 h-6" />
            </a>
            <AccountButton onSignInClick={() => setIsAuthModalOpen(true)} userLocation={userLocation} />
          </div>
        </header>

        <Navigation activeTab={activeTab} />
        
        <main className="w-full flex-grow flex items-center justify-center">
          { apiKey ? renderPage() : <LoadingSpinner /> }
        </main>

      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      {isApiKeyModalOpen && <ApiKeyModal onSave={handleSaveApiKey} />}
    </>
  );
};

export default App;
