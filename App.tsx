import React, { useState, useCallback, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { RecommendationGrid } from './components/RecommendationGrid';
import { DetailModal } from './components/DetailModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import { MediaRow } from './components/MediaRow';
import { getRecommendations } from './services/geminiService';
import { 
  fetchFullMediaDetails,
  fetchDetailsForModal,
  getTrending,
  getPopularMovies,
  getPopularTv,
  getNowPlayingMovies 
} from './services/tmdbService';
import type { MediaDetails } from './types';

const App: React.FC = () => {
  const [recommendations, setRecommendations] = useState<MediaDetails[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [homeSections, setHomeSections] = useState<{title: string, items: MediaDetails[]}[]>([]);
  const [isHomeLoading, setIsHomeLoading] = useState<boolean>(true);


  useEffect(() => {
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
        if (trending.length > 0) sections.push({ title: 'Trending This Week', items: trending });
        if (popularMovies.length > 0) sections.push({ title: 'Popular Movies', items: popularMovies });
        if (popularTv.length > 0) sections.push({ title: 'Popular TV Shows', items: popularTv });
        if (nowPlayingMovies.length > 0) sections.push({ title: 'Now Playing in Theaters', items: nowPlayingMovies });

        setHomeSections(sections);

      } catch (err) {
        console.error("Failed to load home page data:", err);
        setError("Could not load home page content. Please try searching.");
      } finally {
        setIsHomeLoading(false);
      }
    };

    loadHomePageData();
  }, []);


  const handleSearch = useCallback(async (query: string) => {
    if (!query) return;

    setIsLoading(true);
    setError(null);
    setRecommendations([]);
    setSelectedMedia(null);
    setHomeSections([]);

    try {
      const geminiResults = await getRecommendations(query);
      if (!geminiResults || geminiResults.length === 0) {
        throw new Error('Could not find any recommendations. Try a different prompt.');
      }

      const tmdbPromises = geminiResults.map(rec => 
        fetchFullMediaDetails(rec.title, rec.year, rec.type)
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
    // Set base media immediately to open modal
    setSelectedMedia(media);
    setIsModalLoading(true);
  
    try {
      const details = await fetchDetailsForModal(media.id, media.type);
      // Update the state with the full details
      setSelectedMedia(currentMedia => 
        currentMedia && currentMedia.id === media.id // Ensure we're updating the correct media
          ? { ...currentMedia, ...details } 
          : currentMedia
      );
    } catch (err) {
      console.error("Failed to fetch additional details for modal:", err);
      // Modal will still be open with basic info, which is fine.
    } finally {
      setIsModalLoading(false);
    }
  }, []);

  const handleCloseModal = () => {
    setSelectedMedia(null);
  };

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error && recommendations.length === 0 && homeSections.length === 0) return <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>;
    
    if (recommendations.length > 0) {
      return <RecommendationGrid recommendations={recommendations} onSelect={handleSelectMedia} />;
    }

    if (isHomeLoading) return <LoadingSpinner />;

    if (homeSections.length > 0) {
      return (
        <div className="w-full max-w-7xl flex flex-col gap-8 md:gap-12 fade-in">
          {homeSections.map((section, index) => (
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
    
    // Fallback initial prompt if home sections are empty (e.g., no API key)
    return (
      <div className="text-center text-gray-400">
        <p>What are you in the mood for?</p>
        <p className="text-sm">e.g., "sci-fi movies with a strong female lead" or "lighthearted comedies from the 90s"</p>
      </div>
    );
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: "url('https://picsum.photos/seed/watchnowbg/1920/1080')" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl"></div>
      </div>

      <main className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center">
        <header className="w-full max-w-4xl text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text">
            WatchNow
          </h1>
          <p className="text-gray-300 mt-2 text-lg">AI-powered movie & TV show recommendations.</p>
        </header>

        <div className="w-full max-w-2xl mb-12">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {renderContent()}

        {selectedMedia && <DetailModal media={selectedMedia} onClose={handleCloseModal} isLoading={isModalLoading} />}
      </main>
    </>
  );
};

export default App;