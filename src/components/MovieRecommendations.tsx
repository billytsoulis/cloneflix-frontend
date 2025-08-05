'use client';

import { useState, useEffect } from 'react';
import { Loader2, Frown, Film, Calendar, Star } from 'lucide-react';
import { motion } from 'framer-motion';

// Define the Movie type to match the data structure from your API.
interface Movie {
  _id: string;
  title: string;
  genre: string;
  release_year: number;
  director: string;
  rating: number;
  description: string;
}

// A reusable MovieCard component, extracted from the user's `app/page.tsx`
// to ensure consistency and modularity.
const MovieCard = ({ movie }: { movie: Movie }) => {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      key={movie._id}
      className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 cursor-pointer"
      variants={itemVariants}
    >
      <div className="w-full h-48 bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
        <Film size={48} className="text-gray-500" />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-bold text-white mb-1 leading-tight">{movie.title}</h2>
        <div className="flex items-center text-gray-400 text-sm mb-2">
          <span className="flex items-center mr-4">
            <Calendar size={14} className="mr-1" />
            {movie.release_year}
          </span>
          <span className="flex items-center">
            <Star size={14} className="text-yellow-400 mr-1" />
            {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
          </span>
        </div>
        <p className="text-sm text-gray-300 line-clamp-3">{movie.description}</p>
        <span className="inline-block mt-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
          {movie.genre}
        </span>
      </div>
    </motion.div>
  );
};

// The main MovieRecommendations component to be used on your page.
const MovieRecommendations = () => {
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [errorRecommendations, setErrorRecommendations] = useState<string | null>(null);

  useEffect(() => {
    // This function fetches the movie recommendations from your API.
    const getRecommendedMovies = async () => {
      try {
        setLoadingRecommendations(true);
        const response = await fetch('/api/movies/recommendations');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        // The API response is expected to be an array of movies.
        if (!Array.isArray(data)) {
          throw new Error('API response format is incorrect. Expected an array of movies.');
        }

        setRecommendedMovies(data);
        setErrorRecommendations(null);
      } catch (error: any) {
        console.error("Failed to fetch recommendations:", error);
        setErrorRecommendations("Failed to load recommendations. Please try again later.");
      } finally {
        setLoadingRecommendations(false);
      }
    };

    getRecommendedMovies();
  }, []);

  return (
    <section className="w-full mt-8">
      <h2 className="text-4xl font-bold text-red-600 mb-6 text-center">Recommended For You</h2>
      {loadingRecommendations ? (
        // Loading state with the Loader2 icon and consistent styling.
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
          <p className="ml-4 text-xl text-gray-400">Loading recommendations...</p>
        </div>
      ) : errorRecommendations ? (
        // Error state with the Frown icon and consistent styling.
        <div className="flex justify-center items-center h-48 flex-col">
          <Frown className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-center text-red-400 text-lg">{errorRecommendations}</p>
        </div>
      ) : recommendedMovies.length === 0 ? (
        // Empty state when no recommendations are found.
        <p className="text-center text-gray-400 text-lg">No recommendations available for this genre at the moment.</p>
      ) : (
        // The main movie grid, using framer-motion for the fade-in animation.
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {recommendedMovies.map((movie) => (
            <MovieCard key={`rec-${movie._id}`} movie={movie} />
          ))}
        </motion.div>
      )}
    </section>
  );
};

export default MovieRecommendations;
