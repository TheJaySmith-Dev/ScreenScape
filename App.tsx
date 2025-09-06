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
  fetchApi,
  findBestTrailer
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
import { GitHubIcon, SparklesIcon } from './components/icons.tsx';
import { ApiKeyModal } from './components/ApiKeyModal.tsx';
import * as apiService from './services/apiService.ts';
import { GamePage } from './components/GamePage.tsx';
import { people as allPeople } from './services/peopleService.ts';
import { PersonGrid } from './components/PersonGrid.tsx';
import { AiSearchModal } from './components/AiSearchModal.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { CustomVideoPlayer } from './components/CustomVideoPlayer.tsx';


type ActiveTab = 'home' | 'foryou' | 'watchlist' | 'movies' | 'tv' | 'collections' | 'people' | 'studios' | 'brands' | 'streaming' | 'networks' | 'game';
type AppTheme = 'dark' | 'light';

const App: React.FC = () => {
  const [recommendations, setRecommendations] = useState<MediaDetails[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaDetails | CollectionDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [homeSections, setHomeSections] = useState<{title: string, items: MediaDetails[], type: 'movie' | 'tv' | 'mixed'}[]>([]);
  const [isHomeLoading, setIsHomeLoading] = useState<boolean>(true);
  const [heroItem, setHeroItem] = useState<MediaDetails | null>(null);
  const [heroTrailerId, setHeroTrailerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isVpnBlocked, setIsVpnBlocked] = useState<boolean | null>(null); // null: checking, false: ok, true: blocked
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [tmdbApiKey, setTmdbApiKey] = useState<string | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
  const [theme, setTheme] = useState<AppTheme>('dark');
  const [isAiSearchOpen, setIsAiSearchOpen] = useState(false);

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
    const tmdbKey = apiService.getTmdbApiKey();
    const geminiKey = apiService.getGeminiApiKey();
    let keysMissing = false;

    if (tmdbKey) {
      setTmdbApiKey(tmdbKey);
    } else {
      keysMissing = true;
    }

    if (geminiKey) {
        setGeminiApiKey(geminiKey);
    } else {
        keysMissing = true;
    }

    if (keysMissing) {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  const handleSaveApiKeys = (keys: { tmdbKey: string; geminiKey: string; }) => {
    apiService.saveTmdbApiKey(keys.tmdbKey);
    apiService.saveGeminiApiKey(keys.geminiKey);
    setTmdbApiKey(keys.tmdbKey);
    setGeminiApiKey(keys.geminiKey);
    setIsApiKeyModalOpen(false);
    // Reload to ensure all services re-initialize with the new keys
    window.location.reload();
  };

  useEffect(() => {
    if (!tmdbApiKey) return;

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
        setAvailableProviders(supportedProviders);
      }
    };
    initApp();
  }, [tmdbApiKey]);
  
  const loadHomePage = useCallback(async () => {
    setIsHomeLoading(true);
    setError(null);
    try {
      const trending = await getTrending();
      const popularMovies = await getPopularMovies();
      const popularTv = await getPopularTv();
      const nowPlaying = await getNowPlayingMovies();
      const topRatedMovies = await getTopRatedMovies();

      const heroCandidates = [...trending, ...nowPlaying].filter(item => item.backdropUrl && !item.backdropUrl.includes('picsum.photos'));
      setHeroItem(heroCandidates.length > 0 ? heroCandidates[Math.floor(Math.random() * heroCandidates.length)] : null);

      setHomeSections([
        { title: 'Trending This Week', items: trending, type: 'mixed' },
        { title: 'Now Playing in Theaters', items: nowPlaying, type: 'movie' },
        { title: 'Popular Movies', items: popularMovies, type: 'movie' },
        { title: 'Popular TV Shows', items: popularTv, type: 'tv' },
        { title: 'Top Rated Movies', items: topRatedMovies, type: 'movie' },
      ]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error('Failed to load home page:', errorMessage);
      setError("Could not load content. Please check your TMDb API key and internet connection.");
    } finally {
      setIsHomeLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tmdbApiKey && activeTab === 'home' && homeSections.length === 0) {
      loadHomePage();
    }
  }, [tmdbApiKey, activeTab, homeSections.length, loadHomePage]);

  // Main routing effect
  useEffect(() => {
    if (!tmdbApiKey) return;

    const handleRouteChange = async () => {
      setIsLoading(true);
      setSelectedItem(null);
      setSelectedActor(null);
      setSelectedStudio(null);
      setSelectedBrand(null);
      setSelectedProvider(null);
      setSelectedNetwork(null);
      setSelectedPerson(null);
      setRecommendations([]);
      setError(null);
      
      const hash = window.location.hash.substring(1);
      const parts = hash.split('/').filter(Boolean);
      const [page, param] = parts;

      const newActiveTab = (page || 'home') as ActiveTab;
      setActiveTab(newActiveTab);

      try {
        switch (newActiveTab) {
          case 'home':
            if (homeSections.length === 0) await loadHomePage();
            break;
          case 'movies':
            setRecommendations(await getPopularMovies());
            break;
          case 'tv':
            setRecommendations(await getPopularTv());
            break;
          case 'studios':
            if (param) {
              const studio = studios.find(s => s.id === parseInt(param));
              setSelectedStudio(studio || null);
            }
            break;
          case 'brands':
            if (param) {
              const brand = brands.find(b => b.id === param);
              setSelectedBrand(brand || null);
            }
            break;
          case 'streaming':
            if (param && userLocation) {
              const provider = availableProviders.find(p => p.key === param);
              setSelectedProvider(provider || null);
            }
            break;
          case 'networks':
            if (param) {
              const network = networks.find(n => n.id === parseInt(param));
              setSelectedNetwork(network || null);
            }
            break;
          case 'people':
            if (param) {
              const person = people.find(p => p.id === param);
              setSelectedPerson(person || null);
            }
            break;
          case 'collections':
            setIsComingSoonLoading(true);
            setComingSoonMedia(await getComingSoonMedia());
            setIsComingSoonLoading(false);
            break;
          case 'foryou':
          case 'watchlist':
          case 'game':
            break; // Handled by their own components
          default:
            // Fallback to home if route is unknown
            window.location.hash = '/home';
            break;
        }
      } catch (err) {
        setError("Failed to load content for this page.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    handleRouteChange();
    window.addEventListener('hashchange', handleRouteChange);

    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, [tmdbApiKey, studios, brands, availableProviders, networks, people, userLocation, homeSections.length, loadHomePage]);
  
  const handleSelectItem = useCallback(async (item: MediaDetails | Collection) => {
    setIsModalLoading(true);
    setSelectedItem(item);
    window.scrollTo(0, 0);

    try {
        if ('type' in item) { // It's MediaDetails
            if (userLocation) {
                const details = await fetchDetailsForModal(item.id, item.type, userLocation.code);
                setSelectedItem(prev => prev ? { ...prev, ...details } : null);
            }
        } else { // It's Collection
            const details = await fetchCollectionDetails(item.id);
            setSelectedItem(prev => prev ? { ...prev, ...details } : null);
        }
    } catch (error) {
        console.error("Error fetching details for modal:", error);
        setError("Could not load details for this item.");
    } finally {
        setIsModalLoading(false);
    }
  }, [userLocation]);
  
  const handleSelectActor = useCallback(async (actorId: number) => {
    setIsLoading(true);
    setSelectedActor(null);
    setSelectedItem(null);
    window.location.hash = `#/actor/${actorId}`;
    try {
      const details = await fetchActorDetails(actorId);
      setSelectedActor(details);
    } catch (error) {
      setError("Could not load actor details.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleCloseModal = () => {
    setSelectedItem(null);
    setSelectedActor(null);
    // Go back in history if we are on a deep-linked detail page
    const hashParts = window.location.hash.split('/');
    if (hashParts[1] === 'actor' || hashParts[1] === 'movie' || hashParts[1] === 'tv') {
      window.history.back();
    }
  };

  const handleSearch = async (query: string) => {
    if (!query) return;
    setIsLoading(true);
    setRecommendations([]);
    setActiveTab('home'); // Reset tab to a neutral state
    setSelectedItem(null);
    setHeroItem(null);
    setHomeSections([]);
    try {
      const results = await searchMedia(query);
      setRecommendations(results);
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayHeroTrailer = async (item: MediaDetails) => {
    try {
        const details = await fetchApi<{ videos: { results: any[] } }>(`/${item.type}/${item.id}?append_to_response=videos`);
        const trailer = findBestTrailer(details.videos.results);
        if (trailer) {
            setHeroTrailerId(trailer.key);
        } else {
            // Fallback to searching on YouTube
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(item.title + ' trailer')}`, '_blank');
        }
    } catch (error) {
        console.error("Could not fetch trailer:", error);
    }
  };

  const mainContent = useMemo(() => {
    if (isLoading && !selectedItem && !selectedActor) {
      return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
    }
    if (error) {
      return <div className="text-center text-red-400 p-4 bg-red-500/20 rounded-lg">{error}</div>;
    }
    if (selectedActor) {
      return <ActorPage actor={selectedActor} onBack={handleCloseModal} onSelectMedia={handleSelectItem} />;
    }
    if (selectedItem) {
      return <DetailModal item={selectedItem} onClose={handleCloseModal} isLoading={isModalLoading} onSelectMedia={handleSelectItem} onSelectActor={handleSelectActor} userLocation={userLocation} />;
    }

    if (recommendations.length > 0) {
      return <RecommendationGrid recommendations={recommendations} onSelect={handleSelectItem} />;
    }

    switch (activeTab) {
      case 'home':
        return homeSections.map((section, index) => (
          <MediaRow key={section.title} title={section.title} items={section.items} onSelect={handleSelectItem} animationDelay={`${index * 150}ms`} />
        ));
      case 'studios':
        return selectedStudio ? <div>Studio Detail Page: {selectedStudio.name}</div> : <StudioGrid studios={studios} onSelect={(studio) => window.location.hash = `/studios/${studio.id}`} />;
      case 'brands':
        return selectedBrand ? <BrandDetail brand={selectedBrand} media={brandMedia} mediaTypeFilter={brandMediaTypeFilter} setMediaTypeFilter={setBrandMediaTypeFilter} sortBy={brandSortBy} setSortBy={setBrandSortBy} onBack={() => window.location.hash = '/brands'} onSelectMedia={handleSelectItem} onSelectCollection={handleSelectItem} /> : <BrandGrid brands={brands} onSelect={(brand) => window.location.hash = `/brands/${brand.id}`} />;
      case 'streaming':
        return selectedProvider ? <div>Provider Detail Page: {selectedProvider.name}</div> : <StreamingGrid providers={availableProviders} onSelect={(provider) => window.location.hash = `/streaming/${provider.key}`} />;
      case 'networks':
        return selectedNetwork ? <div>Network Detail Page: {selectedNetwork.name}</div> : <NetworkGrid networks={networks} onSelect={(network) => window.location.hash = `/networks/${network.id}`} />;
      case 'people':
        return selectedPerson ? <div>Person Detail Page: {selectedPerson.name}</div> : <PersonGrid people={people} onSelect={(person) => window.location.hash = `/people/${person.id}`} />;
      case 'foryou':
        return <ForYouPage onSelectMedia={handleSelectItem} />;
      case 'watchlist':
        return <WatchlistPage onSelectMedia={handleSelectItem} />;
      case 'collections':
        return isComingSoonLoading ? <LoadingSpinner /> : <ComingSoonPage media={comingSoonMedia} onSelectMedia={handleSelectItem} />;
      case 'game':
        return <GamePage />;
      default:
        return null;
    }
  }, [isLoading, selectedItem, selectedActor, error, recommendations, activeTab, homeSections, handleSelectItem, handleCloseModal, isModalLoading, handleSelectActor, userLocation, selectedStudio, studios, selectedBrand, brandMedia, brandMediaTypeFilter, brandSortBy, brands, selectedProvider, availableProviders, selectedNetwork, networks, selectedPerson, people, isComingSoonLoading, comingSoonMedia]);

  return (
    <div className={`app-container bg-black text-white min-h-screen transition-colors duration-500 ${theme}`}>
      {isApiKeyModalOpen && <ApiKeyModal onSave={handleSaveApiKeys} />}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <AiSearchModal isOpen={isAiSearchOpen} onClose={() => setIsAiSearchOpen(false)} onSelectMedia={handleSelectItem} />
      {heroTrailerId && <CustomVideoPlayer videoId={heroTrailerId} onClose={() => setHeroTrailerId(null)} />}

      <header className="fixed top-0 left-0 right-0 z-40 p-4 transition-all duration-300">
        <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
                {/* Logo or App Name could go here */}
            </div>
            <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAiSearchOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 glass-panel rounded-full font-semibold text-white transition-all duration-300 hover:bg-white/5 hover:scale-105"
                  aria-label="Open AI-powered search"
                >
                    <SparklesIcon className="w-5 h-5 text-indigo-400"/>
                    <span className="hidden sm:inline">AI Search</span>
                </button>
                <a href="https://github.com/google/labs-prototypes/tree/main/seeds/screenscape-dev-v2" target="_blank" rel="noopener noreferrer" className="p-2.5 glass-panel rounded-full text-white transition-all duration-300 hover:bg-white/5 hover:scale-105">
                    <GitHubIcon className="w-5 h-5"/>
                </a>
                <AccountButton onSignInClick={() => setIsAuthModalOpen(true)} userLocation={userLocation} />
            </div>
        </div>
      </header>
      
      <main className="flex flex-col items-center">
        {!selectedItem && !selectedActor && heroItem && activeTab === 'home' && (
          <HeroSection item={heroItem} onPlay={handlePlayHeroTrailer} onMoreInfo={handleSelectItem} />
        )}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full z-10" style={{ paddingTop: (!selectedItem && !selectedActor && heroItem && activeTab === 'home') ? '0' : '80px' }}>
          <div className="flex flex-col items-center gap-8 py-8">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            <Navigation activeTab={activeTab} />
            {mainContent}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
