// frontend/src/app/page.tsx

"use client"; // This is a client component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser, fetchAllMovies, fetchMovieRecommendations, fetchUserProfile, searchMovies, Movie } from '@/lib/api'; // Import searchMovies
import toast from 'react-hot-toast'; // For notifications
import MovieCard from '@/components/MovieCard'; // Import MovieCard component

export default function HomePage() {
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = useState(true); // Initial loading state for authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track authentication status
  const [allMovies, setAllMovies] = useState<Movie[]>([]); // State for all movies
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]); // State for recommended movies
  const [loadingAllMovies, setLoadingAllMovies] = useState(true); // State for all movie loading
  const [loadingRecommendations, setLoadingRecommendations] = useState(true); // State for recommendation loading
  const [errorAllMovies, setErrorAllMovies] = useState<string | null>(null); // State for all movie fetching errors
  const [errorRecommendations, setErrorRecommendations] = useState<string | null>(null); // State for recommendation fetching errors
  const [selectedGenre, setSelectedGenre] = useState<string>(''); // State for selected genre for recommendations
  const [availableGenres, setAvailableGenres] = useState<string[]>([]); // State for available genres
  const [searchQuery, setSearchQuery] = useState<string>(''); // New: State for search input
  const [searchResults, setSearchResults] = useState<Movie[]>([]); // New: State for search results
  const [loadingSearch, setLoadingSearch] = useState(false); // New: State for search loading
  const [errorSearch, setErrorSearch] = useState<string | null>(null); // New: State for search errors

  useEffect(() => {
    const checkAuthenticationAndLoadData = async () => {
      try {
        await fetchUserProfile();
        setIsAuthenticated(true);
        setErrorProfile(null);

        const getAllMovies = async () => {
          try {
            setLoadingAllMovies(true);
            const fetchedMovies = await fetchAllMovies();
            setAllMovies(fetchedMovies);
            const genres = Array.from(new Set(fetchedMovies.map(movie => movie.genre))).sort();
            setAvailableGenres(['', ...genres]);
            setErrorAllMovies(null);
          } catch (error: any) {
            console.error("Failed to fetch all movies:", error);
            setErrorAllMovies("Failed to load all movies. Please try again later.");
            toast.error("Failed to load all movies. Please check the FastAPI service.");
          } finally {
            setLoadingAllMovies(false);
          }
        };

        getAllMovies();

      } catch (error: any) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
        toast.error("You are not logged in. Please log in to access Cloneflix.");
        router.push('/login');
      } finally {
        setLoadingAuth(false);
      }
    };

    checkAuthenticationAndLoadData();
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const getRecommendedMovies = async () => {
      try {
        setLoadingRecommendations(true);
        const fetchedRecommendations = await fetchMovieRecommendations(undefined, selectedGenre);
        setRecommendedMovies(fetchedRecommendations);
        setErrorRecommendations(null);
      } catch (error: any) {
        console.error("Failed to fetch recommendations:", error);
        setErrorRecommendations("Failed to load recommendations. Please try again later.");
        toast.error("Failed to load recommendations. Please check the FastAPI service.");
      } finally {
        setLoadingRecommendations(false);
      }
    };

    getRecommendedMovies();
  }, [isAuthenticated, selectedGenre]);

  // New: Effect for handling search
  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim() === '') {
        setSearchResults([]); // Clear results if query is empty
        setErrorSearch(null);
        return;
      }

      setLoadingSearch(true);
      try {
        const results = await searchMovies(searchQuery);
        setSearchResults(results);
        setErrorSearch(null);
      } catch (error: any) {
        console.error("Error during movie search:", error);
        setErrorSearch("Failed to perform search. Please try again.");
        toast.error("Failed to perform search.");
      } finally {
        setLoadingSearch(false);
      }
    };

    // Debounce the search input to avoid too many API calls
    const handler = setTimeout(() => {
      handleSearch();
    }, 500); // Wait 500ms after user stops typing

    return () => {
      clearTimeout(handler); // Clear timeout if component unmounts or query changes
    };
  }, [searchQuery]); // Re-run search when searchQuery changes

  const handleLogout = async () => {
    setLoadingAuth(true);
    try {
      await logoutUser();
      toast.success("Logged out successfully!");
      router.push('/login');
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Logout failed.");
    } finally {
      setLoadingAuth(false);
    }
  };

  const [errorProfile, setErrorProfile] = useState<string | null>(null);

  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
        <p className="ml-4 text-xl">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900 text-white font-inter">
        <p className="text-center text-red-400 text-lg mb-4">Access Denied. Please log in.</p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-3 text-lg font-semibold rounded-md bg-red-600 hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-4 bg-gray-900 text-white font-inter">
      <div className="w-full max-w-6xl text-center mb-8">
        <h1 className="text-5xl font-bold text-red-600 mb-4">Welcome to Cloneflix!</h1>
        <p className="text-xl text-gray-300 mb-8">
          Enjoy your personalized recommendations and explore our movie library.
        </p>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-6xl mb-8">
        <input
          type="text"
          placeholder="Search movies by title or genre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-5 py-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 text-lg"
        />
      </div>

      {/* Conditional Rendering for Search Results or Recommendations/All Movies */}
      {searchQuery.trim() !== '' ? (
        // Display Search Results
        <div className="w-full max-w-6xl mt-8">
          <h2 className="text-4xl font-bold text-red-600 mb-6 text-center">Search Results for "{searchQuery}"</h2>
          {loadingSearch ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
              <p className="ml-4 text-xl text-gray-400">Searching...</p>
            </div>
          ) : errorSearch ? (
            <p className="text-center text-red-400 text-lg">{errorSearch}</p>
          ) : searchResults.length === 0 ? (
            <p className="text-center text-gray-400 text-lg">No movies found matching your search.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {searchResults.map((movie) => (
                <MovieCard key={`search-${movie.id}`} movie={movie} />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Display Recommendations and All Movies when no search query
        <>
          {/* Genre Selection Dropdown */}
          <div className="w-full max-w-6xl mb-8 flex justify-center items-center">
            <label htmlFor="genre-select" className="text-lg font-semibold text-gray-300 mr-4">
              Filter Recommendations by Genre:
            </label>
            <select
              id="genre-select"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
            >
              <option value="">All Genres</option>
              {availableGenres.map(genre => (
                genre && <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          {/* Recommended Movies Section */}
          <div className="w-full max-w-6xl mt-8">
            <h2 className="text-4xl font-bold text-red-600 mb-6 text-center">Recommended For You</h2>
            {loadingRecommendations ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
                <p className="ml-4 text-xl text-gray-400">Loading recommendations...</p>
              </div>
            ) : errorRecommendations ? (
              <p className="text-center text-red-400 text-lg">{errorRecommendations}</p>
            ) : recommendedMovies.length === 0 ? (
              <p className="text-center text-gray-400 text-lg">No recommendations available for this genre at the moment.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {recommendedMovies.map((movie) => (
                  <MovieCard key={`rec-${movie.id}`} movie={movie} />
                ))}
              </div>
            )}
          </div>

          {/* All Movies Section */}
          <div className="w-full max-w-6xl mt-12">
            <h2 className="text-4xl font-bold text-red-600 mb-6 text-center">All Available Movies</h2>
            {loadingAllMovies ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
                <p className="ml-4 text-xl text-gray-400">Loading all movies...</p>
              </div>
            ) : errorAllMovies ? (
              <p className="text-center text-red-400 text-lg">{errorAllMovies}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {allMovies.map((movie) => (
                  <MovieCard key={`all-${movie.id}`} movie={movie} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
