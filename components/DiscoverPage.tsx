import React, { useState, useEffect } from 'react';
import * as mediaService from '../services/mediaService.ts';
import { RecommendationGrid } from './RecommendationGrid.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { MDBListCarousel } from './MDBListCarousel.tsx';
import type { MediaDetails } from '../types.ts';

interface Genre {
  id: number;
  name: string;
}

export const DiscoverPage: React.FC<{ onSelectMedia: (media: MediaDetails) => void; }> = ({ onSelectMedia }) => {
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [releaseYear, setReleaseYear] = useState<string>('');
  const [results, setResults] = useState<MediaDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const fetchedGenres = await mediaService.getGenres(mediaType);
        setGenres(fetchedGenres);
      } catch (err) {
        setError('Failed to fetch genres.');
        console.error(err);
      }
    };
    fetchGenres();
  }, [mediaType]);

  const handleGenreChange = (genreId: number) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const searchResults = await mediaService.discoverMedia(
        mediaType,
        selectedGenres,
        releaseYear
      );
      setResults(searchResults);
    } catch (err) {
      setError('Failed to perform search.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-white">Discover</h1>

      <MDBListCarousel listId="1" title="Trending on MDBList" onSelectMedia={onSelectMedia} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1 space-y-6 glass-panel p-6 rounded-2xl self-start">
          <div>
            <h2 className="text-xl font-semibold mb-4">Filters</h2>

            {/* Media Type Switcher */}
            <div className="mb-6">
              <span className="text-gray-300 font-semibold block mb-2">Media Type</span>
              <div className="flex bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setMediaType('movie')}
                  className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${mediaType === 'movie' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-white/20'}`}
                >
                  Movies
                </button>
                <button
                  onClick={() => setMediaType('tv')}
                  className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${mediaType === 'tv' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-white/20'}`}
                >
                  TV Shows
                </button>
              </div>
            </div>

            {/* Genre Filter */}
            <div className="mb-6">
              <span className="text-gray-300 font-semibold block mb-2">Genres</span>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {genres.map(genre => (
                  <label key={genre.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(genre.id)}
                      onChange={() => handleGenreChange(genre.id)}
                      className="form-checkbox h-5 w-5 text-indigo-600 bg-gray-800 border-gray-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-gray-300">{genre.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Release Year Filter */}
            <div className="mb-6">
                <label htmlFor="release-year" className="text-gray-300 font-semibold block mb-2">Release Year</label>
                <input
                    type="number"
                    id="release-year"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(e.target.value)}
                    placeholder="e.g., 2023"
                    className="w-full bg-white/10 border-white/20 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
            </div>

            <button
              onClick={handleSearch}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Search
            </button>
          </div>
        </aside>

        <main className="md:col-span-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : results.length > 0 ? (
            <RecommendationGrid recommendations={results} onSelect={onSelectMedia} />
          ) : (
            <div className="text-center text-gray-400 glass-panel p-12 rounded-2xl">
              <p>Use the filters to discover new titles.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
