// frontend/src/app/components/MovieCard.tsx

"use client"; // This is a client component

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Movie, addMovieToWatchlist, removeMovieFromWatchlist, checkMovieInWatchlist } from '@/lib/api'; // Import watchlist API functions
import { Heart, HeartCrack } from 'lucide-react'; // Import icons for watchlist

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loadingWatchlist, setLoadingWatchlist] = useState(true); // New state for loading watchlist status

  // Check if the movie is in the watchlist when the component mounts or movie.id changes
  useEffect(() => {
    const checkStatus = async () => {
      setLoadingWatchlist(true);
      try {
        const isAdded = await checkMovieInWatchlist(movie.id);
        setIsInWatchlist(isAdded);
      } catch (error) {
        console.error("Error checking watchlist status:", error);
        // Do not show a toast for this, as it might spam users on every card load
      } finally {
        setLoadingWatchlist(false);
      }
    };
    checkStatus();
  }, [movie.id]); // Re-run when movie ID changes

  const handleToggleWatchlist = async (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent navigating to the movie detail page
    event.stopPropagation(); // Stop event propagation to parent Link

    if (loadingWatchlist) return; // Prevent action if still checking status

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

  return (
    // Wrap the card content with a Next.js Link component
    // This will navigate to /movies/[id] when clicked
    <Link href={`/movies/${movie.id}`} passHref>
      <div className="relative bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl border border-gray-700 cursor-pointer">
        <div className="p-4">
          <h3 className="text-xl font-bold text-red-500 mb-2">{movie.title}</h3>
          <p className="text-gray-400 text-sm mb-1">
            <span className="font-semibold text-gray-300">Genre:</span> {movie.genre}
          </p>
          <p className="text-gray-400 text-sm mb-1">
            <span className="font-semibold text-gray-300">Year:</span> {movie.release_year}
          </p>
          {movie.director && (
            <p className="text-gray-400 text-sm mb-1">
              <span className="font-semibold text-gray-300">Director:</span> {movie.director}
            </p>
          )}
          {movie.rating && (
            <p className="text-gray-400 text-sm">
              <span className="font-semibold text-gray-300">Rating:</span> {movie.rating} / 10
            </p>
          )}
        </div>

        {/* Watchlist Button */}
        <button
          onClick={handleToggleWatchlist}
          disabled={loadingWatchlist} // Disable button while checking/toggling
          className="absolute top-2 right-2 p-2 rounded-full bg-gray-700 bg-opacity-75 hover:bg-opacity-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        >
          {loadingWatchlist ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : isInWatchlist ? (
            <HeartCrack className="h-6 w-6 text-red-500" /> // Icon for "in watchlist"
          ) : (
            <Heart className="h-6 w-6 text-gray-300" /> // Icon for "not in watchlist"
          )}
        </button>
      </div>
    </Link>
  );
};

export default MovieCard;
