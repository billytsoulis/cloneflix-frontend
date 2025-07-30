// frontend/src/app/movies/[id]/page.tsx

"use client"; // This is a client component

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAllMovies, Movie, addMovieToWatchlist, removeMovieFromWatchlist, checkMovieInWatchlist } from '@/lib/api'; // Import watchlist API functions
import toast from 'react-hot-toast'; // For notifications
import Link from 'next/link'; // Import Link for navigation
import { Heart, HeartCrack } from 'lucide-react'; // Import icons for watchlist
import SimilarMoviesSection from '@/components/SimilarMoviesSection'; // New: Import SimilarMoviesSection

interface MovieDetailsPageProps {
  params: Promise<{
    id: string; // The movie ID from the URL will be a string
  }>;
}

export default function MovieDetailsPage({ params: paramsPromise }: MovieDetailsPageProps) {
  const params = use(paramsPromise);
  const router = useRouter();
  const movieId = parseInt(params.id, 10); // Parse the ID from string to number

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loadingWatchlist, setLoadingWatchlist] = useState(true); // State for loading watchlist status

  useEffect(() => {
    if (isNaN(movieId)) {
      setError("Invalid movie ID.");
      setLoading(false);
      toast.error("Invalid movie ID provided.");
      return;
    }

    const getMovie = async () => {
      try {
        setLoading(true);
        const allMovies = await fetchAllMovies();
        const foundMovie = allMovies.find(m => m.id === movieId);

        if (foundMovie) {
          setMovie(foundMovie);
          setError(null);
          // After fetching movie, check its watchlist status
          try {
            const isAdded = await checkMovieInWatchlist(foundMovie.id);
            setIsInWatchlist(isAdded);
          } catch (watchlistError) {
            console.error("Error checking watchlist status for detail page:", watchlistError);
            // Don't block page load for watchlist status, but log the error
          } finally {
            setLoadingWatchlist(false);
          }
        } else {
          setError("Movie not found.");
          toast.error("Movie not found.");
        }
      } catch (err: any) {
        console.error(`Error fetching movie with ID ${movieId}:`, err);
        setError("Failed to load movie details. Please try again later.");
        toast.error("Failed to load movie details. Please check the backend service.");
      } finally {
        setLoading(false);
      }
    };

    getMovie();
  }, [movieId]); // Re-run effect if movieId changes

  const handleToggleWatchlist = async () => {
    if (!movie || loadingWatchlist) return; // Prevent action if movie data is not loaded or already loading

    setLoadingWatchlist(true); // Set loading state for the action
    try {
      if (isInWatchlist) {
        await removeMovieFromWatchlist(movie.id);
        setIsInWatchlist(false);
        toast.success(`'${movie.title}' removed from watchlist!`);
      } else {
        // Ensure movieTitle and movieGenre are available
        if (!movie.title || !movie.genre) {
          toast.error("Missing movie details to add to watchlist.");
          return;
        }
        await addMovieToWatchlist(movie.id, movie.title, movie.genre);
        setIsInWatchlist(true);
        toast.success(`'${movie.title}' added to watchlist!`);
      }
    } catch (error: any) {
      console.error("Error toggling watchlist:", error);
      const errorMessage = error.response?.data || "Failed to update watchlist.";
      toast.error(errorMessage);
    } finally {
      setLoadingWatchlist(false); // Reset loading state
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
        <p className="ml-4 text-xl">Loading movie details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900 text-white font-inter">
        <p className="text-center text-red-400 text-lg mb-4">{error}</p>
        <Link href="/" passHref>
          <button className="px-6 py-3 text-lg font-semibold rounded-md bg-red-600 hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900">
            Go back to Home
          </button>
        </Link>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900 text-white font-inter">
        <p className="text-center text-gray-400 text-lg mb-4">No movie data available.</p>
        <Link href="/" passHref>
          <button className="px-6 py-3 text-lg font-semibold rounded-md bg-red-600 hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900">
            Go back to Home
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white font-inter">
      <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8">
        <div className="flex justify-between items-center mb-6">
          <Link href="/" passHref>
            <button className="px-4 py-2 text-md font-semibold rounded-md bg-gray-700 hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900">
              &larr; Back to Movies
            </button>
          </Link>
          {/* Watchlist Button for Detail Page */}
          <button
            onClick={handleToggleWatchlist}
            disabled={loadingWatchlist}
            className="p-3 rounded-full bg-gray-700 bg-opacity-75 hover:bg-opacity-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          >
            {loadingWatchlist ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
            ) : isInWatchlist ? (
              <HeartCrack className="h-8 w-8 text-red-500" />
            ) : (
              <Heart className="h-8 w-8 text-gray-300" />
            )}
          </button>
        </div>

        <h1 className="text-5xl font-bold text-red-600 mb-4">{movie.title}</h1>
        <p className="text-xl text-gray-300 mb-6">{movie.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg mb-8">
          <p className="text-gray-400">
            <span className="font-semibold text-gray-300">Genre:</span> {movie.genre}
          </p>
          <p className="text-gray-400">
            <span className="font-semibold text-gray-300">Release Year:</span> {movie.release_year}
          </p>
          {movie.director && (
            <p className="text-gray-400">
              <span className="font-semibold text-gray-300">Director:</span> {movie.director}
            </p>
          )}
          {movie.rating && (
            <p className="text-gray-400">
              <span className="font-semibold text-gray-300">Rating:</span> {movie.rating} / 10
            </p>
          )}
        </div>

        {/* New: Similar Movies Section */}
        {movie.genre && ( // Only render if movie genre is available
          <SimilarMoviesSection
            genre={movie.genre}
            currentMovieId={movie.id}
            title={`More like "${movie.title}"`} // Catchy title
          />
        )}
      </div>
    </div>
  );
}
