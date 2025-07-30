// frontend/src/app/page.tsx

"use client"; // This is a client component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser, fetchAllMovies, fetchMovieRecommendations, fetchUserProfile, Movie } from '@/lib/api'; // Import fetchAllMovies and Movie interface
import toast from 'react-hot-toast'; // For notifications
import MovieCard from '@/components/MovieCard';  

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

  useEffect(() => {
    const checkAuthenticationAndLoadData = async () => {
      try {
        // Attempt to fetch user profile. This endpoint is protected by Spring Security.
        // If it succeeds, the user is authenticated. If it fails (e.g., 401), they are not.
        await fetchUserProfile();
        setIsAuthenticated(true);
        setErrorProfile(null); // Clear any previous profile errors

        // If authenticated, proceed to load movies and recommendations
        const getAllMovies = async () => {
          try {
            setLoadingAllMovies(true);
            const fetchedMovies = await fetchAllMovies();
            setAllMovies(fetchedMovies);
            setErrorAllMovies(null);
          } catch (error: any) {
            console.error("Failed to fetch all movies:", error);
            setErrorAllMovies("Failed to load all movies. Please try again later.");
            toast.error("Failed to load all movies. Please check the FastAPI service.");
          } finally {
            setLoadingAllMovies(false);
          }
        };

        const getRecommendedMovies = async () => {
          try {
            setLoadingRecommendations(true);
            const fetchedRecommendations = await fetchMovieRecommendations();
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

        getAllMovies();
        getRecommendedMovies();

      } catch (error: any) {
        // If fetchUserProfile fails, it means the user is not authenticated or the token is invalid.
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
        toast.error("You are not logged in. Please log in to access Cloneflix.");
        router.push('/login'); // Redirect to login page
      } finally {
        setLoadingAuth(false); // Authentication check is complete
      }
    };

    checkAuthenticationAndLoadData();
  }, [router]); // Dependency array includes router to avoid lint warnings

  const handleLogout = async () => {
    setLoadingAuth(true); // Use loadingAuth for the logout button state as well
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

  // State for profile error, used by checkAuthenticationAndLoadData
  const [errorProfile, setErrorProfile] = useState<string | null>(null);

  // Show a global loading spinner while checking authentication
  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
        <p className="ml-4 text-xl">Checking authentication...</p>
      </div>
    );
  }

  // If not authenticated (and not loading anymore), the redirection to /login should have happened.
  // This block is a fallback in case redirection somehow fails or is delayed.
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
          You are now logged in. Enjoy your personalized recommendations!
        </p>
        <button
          onClick={handleLogout}
          disabled={loadingAuth}
          className="px-6 py-3 text-lg font-semibold rounded-md bg-red-600 hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingAuth ? 'Logging out...' : 'Logout'}
        </button>
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
          <p className="text-center text-gray-400 text-lg">No recommendations available at the moment.</p>
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
    </div>
  );
}
