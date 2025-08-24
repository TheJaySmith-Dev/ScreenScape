
import React, { useState, useCallback, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { RecommendationGrid } from './components/RecommendationGrid';
import { CollectionGrid } from './components/CollectionGrid';
import { DetailModal } from './components/DetailModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import { MediaRow } from './components/MediaRow';
import { Navigation } from './components/Navigation';
import { GlobeIcon, VisionIcon } from './components/icons';
import { getRecommendations } from './services/geminiService';
import { 
  fetchDetailsForModal,
  fetchCollectionDetails,
  getTrending,
  getPopularMovies,
  getPopularTv,
  getNowPlayingMovies,
  getMovieCollections,
  fetchDetailsByTitle
} from './services/tmdbService';
import type { MediaDetails, Collection, CollectionDetails, UserLocation } from './types';
import { VisionModal } from './components/VisionModal';

type ActiveTab = 'home' | 'movies' | 'tv' | 'collections';

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
  const [isVisionModalOpen, setIsVisionModalOpen] = useState<boolean>(false);


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


  useEffect(() => {
    if (isVpnBlocked === false) { // Only load data if VPN check has passed
      const loadHomePageData = async () => {
        setIsHomeLoading(true);
        try {
          const [trending, popularMovies, popularTv, nowPlayingMovies] = await Promise.all([
            getTrending(),
            getPopularMovies(),
            getPopularTv(),
            getNowPlayingMovies()
          ]);
          
          const sections = [];
          if (trending.length > 0) sections.push({ title: 'Trending This Week', items: trending, type: 'mixed' as const });
          if (popularMovies.length > 0) sections.push({ title: 'Popular Movies', items: popularMovies, type: 'movie' as const });
          if (popularTv.length > 0) sections.push({ title: 'Popular TV Shows', items: popularTv, type: 'tv' as const });
          if (nowPlayingMovies.length > 0) sections.push({ title: 'Now Playing in Theaters', items: nowPlayingMovies, type: 'movie' as const });

          setHomeSections(sections);

        } catch (err) {
          console.error("Failed to load home page data:", err);
          setError("Could not load home page content. Please try searching.");
        } finally {
          setIsHomeLoading(false);
        }
      };

      const loadCollectionsData = async () => {
          setIsHomeLoading(true);
          try {
              const movieCollections = await getMovieCollections();
              setCollections(movieCollections);
          } catch(err) {
              console.error("Failed to load collections data:", err);
              setError("Could not load collections. Please try again later.");
          } finally {
              setIsHomeLoading(false);
          }
      }
      
      if (activeTab === 'collections') {
          if(collections.length === 0) loadCollectionsData();
      } else {
          if(homeSections.length === 0) loadHomePageData();
      }
    }
  }, [activeTab, collections.length, homeSections.length, isVpnBlocked]);


  const handleSearch = useCallback(async (query: string) => {
    if (!query) return;

    setIsLoading(true);
    setError(null);
    setRecommendations([]);
    setSelectedItem(null);
    setActiveTab('home');

    try {
      const geminiResults = await getRecommendations(query);
      if (!geminiResults || geminiResults.length === 0) {
        throw new Error('Could not find any recommendations. Try a different prompt.');
      }

      const tmdbPromises = geminiResults.map(rec => 
        fetchDetailsByTitle(rec.title, rec.type)
      );

      const tmdbResults = await Promise.all(tmdbPromises);
      const validResults = tmdbResults.filter((result): result is MediaDetails => result !== null);

      if(validResults.length === 0) {
        setError("Found recommendations, but couldn't fetch their details. Please try again.");
      } else {
        setRecommendations(validResults);
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectMedia = useCallback(async (media: MediaDetails) => {
    setSelectedItem(media);
    setIsModalLoading(true);
  
    try {
      const details = await fetchDetailsForModal(media.id, media.type);
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
  }, []);

  const handleSelectMediaFromVision = useCallback((media: MediaDetails) => {
      setIsVisionModalOpen(false);
      // Use a timeout to allow the modal to close before opening the next one
      setTimeout(() => {
          handleSelectMedia(media);
      }, 300);
  }, [handleSelectMedia]);

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

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const clearSearch = () => {
    setRecommendations([]);
    setError(null);
  }

  const handleTabChange = (tab: ActiveTab) => {
    clearSearch();
    setActiveTab(tab);
  };

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error && recommendations.length === 0) return <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>;
    
    if (recommendations.length > 0) {
      return <RecommendationGrid recommendations={recommendations} onSelect={handleSelectMedia} />;
    }

    if (isHomeLoading) return <LoadingSpinner />;

    if (activeTab === 'collections') {
      return <CollectionGrid collections={collections} onSelect={handleSelectCollection} />
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
        <p className="text-sm">e.g., "sci-fi movies with a strong female lead" or "lighthearted comedies from the 90s"</p>
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
        <header className="w-full max-w-4xl text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text cursor-pointer" onClick={() => { handleTabChange('home')}}>
            WatchNow
          </h1>
          <div className="flex items-center justify-center gap-4 mt-2">
            <p className="text-gray-300 text-lg">AI-powered movie & TV show recommendations.</p>
            {userLocation?.name && (
              <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                <GlobeIcon className="w-4 h-4" />
                <span>{userLocation.name}</span>
              </div>
            )}
          </div>
        </header>
        
        <Navigation activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="w-full max-w-2xl my-8 flex items-center gap-3">
            <div className="flex-grow">
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </div>
            <button 
              onClick={() => setIsVisionModalOpen(true)}
              className="flex-shrink-0 w-14 h-14 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center transition-colors duration-300"
              aria-label="Open WatchNow Vision AI Assistant"
            >
              <VisionIcon className="w-7 h-7 text-white" />
            </button>
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

        <VisionModal 
          isOpen={isVisionModalOpen}
          onClose={() => setIsVisionModalOpen(false)}
          userLocation={userLocation}
          onSelectMedia={handleSelectMediaFromVision}
        />
      </main>
    </>
  );
};

export default App;
