import React, { useState, useEffect } from 'react';
import { getMoviesReleasedOn, getPeopleBornOn } from '../services/mediaService';
import type { MediaDetails } from '../types';
import { RecommendationGrid } from './RecommendationGrid';
import { LoadingSpinner } from './LoadingSpinner';
import { PersonGrid } from './PersonGrid';

export const OnThisDayPage: React.FC = () => {
    const [movies, setMovies] = useState<MediaDetails[]>([]);
    const [people, setPeople] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOnThisDayData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const today = new Date();
                const month = today.getMonth() + 1;
                const day = today.getDate();

                const [moviesResponse, peopleResponse] = await Promise.all([
                    getMoviesReleasedOn(month, day),
                    getPeopleBornOn(month, day)
                ]);

                setMovies(moviesResponse);
                setPeople(peopleResponse);
            } catch (err) {
                setError("Failed to load data for 'On This Day'. Please try again later.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOnThisDayData();
    }, []);

    const handleSelectMedia = (media: MediaDetails) => {
        // This would typically open a detail modal.
        // For this example, we'll just log it.
        console.log('Selected media:', media);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
    }

    if (error) {
        return <div className="text-center text-red-400 py-10">{error}</div>;
    }

    return (
        <div className="w-full max-w-7xl fade-in">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white">On This Day in Film History</h1>
                <p className="text-lg text-gray-400">Movies released and people born on this day.</p>
            </header>

            <section>
                <h2 className="text-2xl font-bold text-white mb-6">Released Today</h2>
                {movies.length > 0 ? (
                    <RecommendationGrid recommendations={movies} onSelect={handleSelectMedia} />
                ) : (
                    <p className="text-gray-400">No movies found that were released on this day.</p>
                )}
            </section>

            <section className="mt-12">
                <h2 className="text-2xl font-bold text-white mb-6">Born Today</h2>
                {people.length > 0 ? (
                    <PersonGrid people={people} onSelect={() => {}} />
                ) : (
                    <p className="text-gray-400">Could not retrieve birthdays at this time.</p>
                )}
            </section>
        </div>
    );
};
