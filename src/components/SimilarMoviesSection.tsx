// frontend/src/app/components/SimilarMoviesSection.tsx

"use client"; // This is a client component

import React, { useEffect, useState } from 'react';
import { fetchMovieRecommendations, Movie } from '@/lib/api'; // Import fetchMovieRecommendations
import MovieCard from './MovieCard'; // Import MovieCard to display recommended movies
import toast from 'react-hot-toast'; // For notifications

interface SimilarMoviesSectionProps {
  genre: string; // The genre to fetch recommendations for
  currentMovieId?: number; // Optional: ID of the movie currently being viewed, to exclude it from recommendations
  title?: string; // Optional: Custom title for the section
}

const SimilarMoviesSection: React.FC<SimilarMoviesSectionProps> = ({ genre, currentMovieId, title }) => {
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getRecommendations = async () => {
      if (!genre) {
        setLoading(false);
        return; // Don't fetch if no genre is provided
      }

      setLoading(true);
      try {
        const fetchedRecommendations = await fetchMovieRecommendations(undefined, genre);
        // Filter out the current movie if its ID is provided
        const filteredRecommendations = currentMovieId
          ? fetchedRecommendations.filter(movie => movie.id !== currentMovieId)
          : fetchedRecommendations;

        // If filtering results in less than 5, try to fetch more or from all genres
        // For simplicity, we'll just display what's filtered.
        // A more advanced approach would re-call the API with different logic if too few results.

        setRecommendedMovies(filteredRecommendations);
        setError(null);
      } catch (err: any) {
        console.error(`Error fetching recommendations for genre '${genre}':`, err);
        setError("Failed to load similar movies. Please try again later.");
        toast.error("Failed to load similar movies.");
      } finally {
        setLoading(false);
      }
    };

    getRecommendations();
  }, [genre, currentMovieId]); // Re-fetch when genre or currentMovieId changes

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
        <p className="ml-4 text-xl text-gray-400">Loading similar movies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-400 text-lg">{error}</p>
    );
  }

  if (recommendedMovies.length === 0) {
    return (
      <p className="text-center text-gray-400 text-lg">No similar movies found for this genre.</p>
    );
  }

  return (
    <div className="w-full mt-12">
      <h2 className="text-4xl font-bold text-red-600 mb-6 text-center">
        {title || `Similar, because you like ${genre}!`} {/* Use custom title or default */}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recommendedMovies.map((movie) => (
          <MovieCard key={`similar-${movie.id}`} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default SimilarMoviesSection;
