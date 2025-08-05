"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
// Importing components from lucide-react as used in your original UI
import { Film, Calendar, Star, Loader2, Frown } from 'lucide-react';
// Importing framer-motion for UI animations
import { motion } from 'framer-motion';

// Import the MovieRecommendations component we just created
import MovieRecommendations from '@/components/MovieRecommendations';

// Dummy API functions for the transition. These will be replaced
// with calls to the new API routes we are about to create.
const fetchAllMovies = async () => {
  const response = await fetch('/api/movies');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const fetchUserProfile = async () => {
  // Placeholder for your actual authentication check.
  // We'll assume the user is authenticated for now.
  return { id: 'user123' };
};

// Define the type for a Movie object to ensure type-safety
type Movie = {
  _id: string; // MongoDB's default ID is a string
  title: string;
  genre: string;
  release_year: number;
  director: string;
  rating: number;
  description: string;
};

// MovieCard Component for reusability, kept from your original code
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
        <span className="inline-block mt-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
          {movie.genre}
        </span>
      </div>
    </motion.div>
  );
};

// Main HomePage Component
export default function HomePage() {
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [loadingAllMovies, setLoadingAllMovies] = useState(true);
  const [errorAllMovies, setErrorAllMovies] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorSearch, setErrorSearch] = useState<string | null>(null);

  // Use a ref to prevent multiple fetches on component mount
  const initialFetchRef = useRef(false);

  // Authentication and initial movie fetch
  useEffect(() => {
    const checkAuthenticationAndLoadData = async () => {
      if (initialFetchRef.current) return;
      initialFetchRef.current = true;

      try {
        await fetchUserProfile();
        setIsAuthenticated(true);
        
        // Fetch all movies after successful authentication
        setLoadingAllMovies(true);
        const fetchedMovies: Movie[] = await fetchAllMovies();

        // Check if fetchedMovies is a valid array before setting state
        if (Array.isArray(fetchedMovies)) {
          setAllMovies(fetchedMovies);
        } else {
          console.error("API did not return an array:", fetchedMovies);
          setErrorAllMovies("Failed to load movies. Data format is incorrect.");
          // Set to an empty array to prevent the .map() error
          setAllMovies([]);
        }
      } catch (error) {
        console.error("Authentication check failed or API fetch failed:", error);
        setIsAuthenticated(false);
        // Assuming there is a login page to redirect to
        router.push('/login'); 
      } finally {
        setLoadingAuth(false);
        setLoadingAllMovies(false);
      }
    };
    
    checkAuthenticationAndLoadData();
  }, [router]);

  // Effect for handling search (client-side with debounce), kept from your original code
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim() === '') {
        setSearchResults([]);
        setErrorSearch(null);
        return;
      }
      setLoadingSearch(true);
      try {
        const results = allMovies.filter(movie =>
          movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(results);
        setErrorSearch(null);
      } catch (error) {
        console.error("Error during movie search:", error);
        setErrorSearch("Failed to perform search. Please try again.");
      } finally {
        setLoadingSearch(false);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, allMovies]);

  // UI rendering based on state
  if (loadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
        <p className="text-xl">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">
        <Frown className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-xl text-center mb-4">Access Denied. Please log in to view movies.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100 font-sans">
      <div className="w-full max-w-full mb-8">
        <input
          type="text"
          placeholder="Search movies by title or genre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-5 py-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 text-lg"
        />
      </div>

      {searchQuery.trim() !== '' ? (
        // Display Search Results
        <motion.div
          className="w-full mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold text-red-600 mb-6 text-center">
            Search Results for "{searchQuery}"
          </h2>
          {loadingSearch ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
              <p className="ml-4 text-xl text-gray-400">Searching...</p>
            </div>
          ) : errorSearch ? (
            <p className="text-center text-red-400 text-lg">{errorSearch}</p>
          ) : searchResults.length === 0 ? (
            <p className="text-center text-gray-400 text-lg">No movies found matching your search.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {searchResults.map((movie) => (
                <MovieCard key={`search-${movie._id}`} movie={movie} />
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        <>
          {/* Recommended Movies Section using the imported component */}
          <section className="w-full mt-8">
            <MovieRecommendations />
          </section>

          {/* All Movies Section */}
          <section className="w-full mt-12">
            <h2 className="text-4xl font-bold text-red-600 mb-6 text-center">All Available Movies</h2>
            {loadingAllMovies ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
                <p className="ml-4 text-xl text-gray-400">Loading all movies...</p>
              </div>
            ) : errorAllMovies ? (
              <p className="text-center text-red-400 text-lg">{errorAllMovies}</p>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {allMovies.map((movie) => (
                  <MovieCard key={`all-${movie._id}`} movie={movie} />
                ))}
              </motion.div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
