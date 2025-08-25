

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
  getMovieCollections,
  getMediaByStudio,
  searchTmdb,
} from './services/tmdbService.ts';
import type { MediaDetails, Collection, CollectionDetails, UserLocation, Studio, Brand } from './types.ts';
import { popularStudios } from './services/studioService.ts';
import { brands as allBrands } from './services/brandService.ts';
import { DetailModal } from './components/DetailModal.tsx';
import { StudioGrid } from './components/StudioGrid.tsx';
import { CollectionGrid } from './components/CollectionGrid.tsx';
import { StudioFilters } from './components/StudioFilters.tsx';
import { BrandGrid } from './components/BrandGrid.tsx';
import { BrandDetail } from './components/BrandDetail.tsx';
import { AccountButton } from './components/AccountButton.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ForYouPage } from './components/ForYouPage.tsx';
import { getStreamingServiceMedia } from './services/mdblistService.ts';


type ActiveTab = 'home' | 'foryou' | 'movies' | 'tv' | 'collections' | 'studios' | 'brands' | 'disney' | 'netflix' | 'prime';
type MediaTypeFilter = 'all' | 'movie' | 'show' | 'short';
type SortBy = 'trending' | 'newest';


const App: React.FC = () => {
  const [recommendations, setRecommendations] = useState<MediaDetails[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaDetails | CollectionDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [homeSections, setHomeSections] = useState<{title: string, items: MediaDetails[], type: 'movie' | 'tv' | 'mixed'}[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isHomeLoading, setIsHomeLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isVpnBlocked, setIsVpnBlocked] = useState<boolean | null>(null); // null: checking, false: ok, true: blocked
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // State for service hubs
  const [serviceMedia, setServiceMedia] = useState<MediaDetails[]>([]);
  const [isServiceMediaLoading, setIsServiceMediaLoading] = useState<boolean>(false);


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


  const checkVpn = useCallback(async () => {
    setIsVpnBlocked(null); // Set to checking state
    setUserLocation(null);
    try {
      // Add a cache buster to ensure a fresh check
      const response = await fetch(`https://ipinfo.io/json?token=3a0f3ae3fa17bb&_=${new Date().getTime()}`);
      if (!response.ok) {
        throw new Error('VPN check service returned an error.');
      }
      const data = await response.json();

      if (data.country) {
        try {
          const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(data.country);
          setUserLocation({ name: countryName ?? data.country, code: data.country });
        } catch (e) {
          console.error("Could not get country name from code: ", data.country, e);
          setUserLocation({ name: data.country, code: data.country }); // Fallback to country code
        }
      }

      if (data.privacy?.vpn === true) {
        setIsVpnBlocked(true);
      } else {
        setIsVpnBlocked(false);
      }
    } catch (error) {
      console.error('Error checking for VPN:', error);
      // Fail open: if the check fails for any reason, allow the user to proceed.
      setIsVpnBlocked(false);
    }
  }, []);

  useEffect(() => {
    checkVpn();
  }, [checkVpn]);


  // Effect for loading primary content based on tab.
  useEffect(() => {
    if (isVpnBlocked !== false) return;

    const loadHomeAndSharedData = async () => {
      setIsHomeLoading(true);
      setError(null);
      try {
        const [
          trending, 
          popularMovies, 
          popularTv, 
          nowPlayingMovies,
        ] = await Promise.all([
          getTrending(),
          getPopularMovies(),
          getPopularTv(),
          getNowPlayingMovies(),
        ]);
        
        const sections = [];
        if (trending.length > 0) sections.push({ title: 'Trending This Week', items: trending, type: 'mixed' as const });
        if (popularMovies.length > 0) sections.push({ title: 'Popular Movies', items: popularMovies, type: 'movie' as const });
        if (popularTv.length > 0) sections.push({ title: 'Popular TV Shows', items: popularTv, type: 'tv' as const });
        if (nowPlayingMovies.length > 0) sections.push({ title: 'Now Playing in Theaters', items: nowPlayingMovies, type: 'movie' as const });
        setHomeSections(sections);
      } catch (err) {
        console.error("Failed to load home data:", err);
        setError("Could not load content. Please try again later.");
      } finally {
        setIsHomeLoading(false);
      }
    };
    
    const loadCollectionsData = async () => {
        setIsHomeLoading(true);
        setError(null);
        try {
            const movieCollections = await getMovieCollections();
            setCollections(movieCollections);
        } catch (err) {
            console.error("Failed to load collections:", err);
            setError("Could not load collections. Please try again later.");
        } finally {
            setIsHomeLoading(false);
        }
    };
    
    const loadServiceData = async (service: 'disney' | 'netflix' | 'prime') => {
        setIsServiceMediaLoading(true);
        setError(null);
        try {
            const media = await getStreamingServiceMedia(service);
            setServiceMedia(media);
        } catch (err) {
            console.error(`Failed to load data for ${service}:`, err);
            setError(`Could not load content for ${service}. Please try again later.`);
        } finally {
            setIsServiceMediaLoading(false);
        }
    };
    
    // Router-like logic to fetch data for the active tab
    if (['home', 'movies', 'tv'].includes(activeTab)) {
        loadHomeAndSharedData();
    } else if (activeTab === 'collections') {
        loadCollectionsData();
    } else if (['disney', 'netflix', 'prime'].includes(activeTab)) {
        loadServiceData(activeTab as 'disney' | 'netflix' | 'prime');
    }
  }, [activeTab, isVpnBlocked]);


  const handleSearch = useCallback(async (query: string) => {
    if (!query) return;

    setIsLoading(true);
    setError(null);
    setRecommendations([]);
    setSelectedItem(null);
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

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const clearSearch = () => {
    setRecommendations([]);
    setError(null);
  }

  const handleTabChange = (tab: ActiveTab) => {
    clearSearch();
    // Reset states for other tabs to ensure fresh content on navigation
    setHomeSections([]);
    setCollections([]);
    setSelectedStudio(null);
    setStudioMedia([]);
    setSelectedBrand(null);
    setBrandMedia([]);
    setServiceMedia([]);
    setActiveTab(tab);
  };

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error && recommendations.length === 0 && !selectedStudio && !selectedBrand && !['disney', 'netflix', 'prime'].includes(activeTab)) {
        return <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>;
    }
    
    if (recommendations.length > 0) {
      return <RecommendationGrid recommendations={recommendations} onSelect={handleSelectMedia} />;
    }
    
    if (['disney', 'netflix', 'prime'].includes(activeTab)) {
        if (isServiceMediaLoading) return <LoadingSpinner />;
        if (error) return <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>;

        const serviceTitleMap = {
            disney: 'Highlights from Disney+',
            netflix: 'Highlights from Netflix',
            prime: 'Highlights from Prime Video',
        };

        return (
            <div className="w-full max-w-7xl fade-in">
                <h2 className="text-3xl font-bold mb-6">{serviceTitleMap[activeTab as keyof typeof serviceTitleMap]}</h2>
                <RecommendationGrid recommendations={serviceMedia} onSelect={handleSelectMedia} />
            </div>
        )
    }

    if (activeTab === 'foryou') {
      return <ForYouPage onSelectMedia={handleSelectMedia} />;
    }

    if (activeTab === 'studios') {
        if (selectedStudio) {
            return (
                <div className="w-full max-w-7xl fade-in">
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
                    {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-lg mb-4">{error}</div>}
                    <RecommendationGrid recommendations={displayedStudioMedia} onSelect={handleSelectMedia} />
                </div>
            )
        }
        return <StudioGrid studios={studios} onSelect={handleSelectStudio} />;
    }

    if (activeTab === 'brands') {
        if (selectedBrand) {
            return (
                <BrandDetail
                    brand={selectedBrand}
                    media={displayedBrandMedia}
                    mediaTypeFilter={brandMediaTypeFilter}
                    setMediaTypeFilter={setBrandMediaTypeFilter}
                    sortBy={brandSortBy}
                    setSortBy={setBrandSortBy}
                    onBack={handleBackToBrands}
                    onSelectMedia={handleSelectMedia}
                    onSelectCollection={handleSelectCollection}
                />
            );
        }
        return <BrandGrid brands={brands} onSelect={handleSelectBrand} />;
    }
    
    if (isHomeLoading && homeSections.length === 0 && collections.length === 0) return <LoadingSpinner />;

    if (activeTab === 'collections') {
      return <CollectionGrid collections={collections} onSelect={handleSelectCollection} />;
    }
    
    const filteredSections = homeSections.filter(section => {
      if (activeTab === 'home') return true;
      if (activeTab === 'movies') return section.type === 'movie';
      if (activeTab === 'tv') return section.type === 'tv';
      return false;
    });

    if (filteredSections.length > 0) {
      return (
        <div className="w-full max-w-7xl flex flex-col gap-8 md:gap-12 fade-in">
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
    
    return (
      <div className="text-center text-gray-400">
        <p>What are you in the mood for?</p>
        <p className="text-sm">e.g., "The Matrix", "Stranger Things", etc.</p>
      </div>
    );
  };
  
  const renderBackground = () => (
    <div 
      className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat" 
      style={{ backgroundImage: "url('https://picsum.photos/seed/watchnowbg/1920/1080')" }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl"></div>
    </div>
  );

  if (isVpnBlocked === null) {
    return (
      <>
        {renderBackground()}
        <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner />
        </div>
      </>
    );
  }

  if (isVpnBlocked) {
    return (
      <>
        {renderBackground()}
        <main className="min-h-screen flex flex-col items-center justify-center text-center p-4">
            <div className="bg-gray-900/50 border border-white/20 rounded-2xl p-8 backdrop-blur-lg max-w-md w-full fade-in">
                <h1 className="text-3xl font-bold text-red-400 mb-4">VPN Detected</h1>
                {userLocation?.name && (
                    <p className="text-gray-400 mb-4">
                        Connection from: {userLocation.name}
                    </p>
                )}
                <p className="text-gray-300 mb-6">
                    Please disable your VPN or proxy service to continue using WatchNow. Our service requires a direct connection to provide accurate, region-specific content.
                </p>
                <button
                    onClick={checkVpn}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-semibold transition-colors duration-300"
                >
                    Retry Connection
                </button>
            </div>
        </main>
      </>
    );
  }


  return (
    <>
      {renderBackground()}

      <main className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center">
        <header className="w-full max-w-4xl mb-8 flex justify-between items-center">
            <div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text cursor-pointer" onClick={() => { handleTabChange('home')}}>
                    WatchNow
                </h1>
                <p className="text-gray-300 text-lg">Discover movies & TV shows.</p>
            </div>
            <AccountButton
                onSignInClick={() => setIsAuthModalOpen(true)}
                userLocation={userLocation}
            />
        </header>
        
        <Navigation activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="w-full max-w-2xl my-8">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {renderContent()}

        {selectedItem && (
          <DetailModal 
            item={selectedItem} 
            onClose={handleCloseModal} 
            isLoading={isModalLoading}
            onSelectMedia={handleSelectMedia}
            userLocation={userLocation}
          />
        )}
        
        <AuthModal 
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
        />
        
      </main>
    </>
  );
};

export default App;