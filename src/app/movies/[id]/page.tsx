// frontend/src/app/movies/[id]/page.tsx

"use client"; // This is a client component

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  fetchAllMovies,
  Movie,
  addMovieToWatchlist,
  removeMovieFromWatchlist,
  checkMovieInWatchlist,
  addOrUpdateRating, // New: Import rating functions
  fetchUserRatingForMovie, // New: Import rating functions
  fetchAverageRatingForMovie, // New: Import rating functions
  deleteRating // New: Import rating functions
} from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Heart, HeartCrack, Star, StarHalf } from 'lucide-react'; // New: Import Star icons
import SimilarMoviesSection from '@/components/SimilarMoviesSection';

interface MovieDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function MovieDetailsPage({ params: paramsPromise }: MovieDetailsPageProps) {
  const params = use(paramsPromise);
  const router = useRouter();
  const movieId = parseInt(params.id, 10);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);

  // New states for rating functionality
  const [userRating, setUserRating] = useState<number | null>(null); // User's personal rating (1-10)
  const [averageRating, setAverageRating] = useState<number | null>(null); // Movie's average rating
  const [loadingRating, setLoadingRating] = useState(true); // Loading state for user/average rating
  const [submittingRating, setSubmittingRating] = useState(false); // Submitting state for rating action

  useEffect(() => {
    if (isNaN(movieId)) {
      setError("Invalid movie ID.");
      setLoading(false);
      toast.error("Invalid movie ID provided.");
      return;
    }

    const getMovieAndRatings = async () => {
      try {
        setLoading(true);
        setLoadingRating(true); // Start loading for ratings
        setLoadingWatchlist(true); // Start loading for watchlist

        const allMovies = await fetchAllMovies();
        const foundMovie = allMovies.find(m => m.id === movieId);

        if (foundMovie) {
          setMovie(foundMovie);
          setError(null);

          // Fetch watchlist status
          try {
            const isAdded = await checkMovieInWatchlist(foundMovie.id);
            setIsInWatchlist(isAdded);
          } catch (watchlistError) {
            console.error("Error checking watchlist status for detail page:", watchlistError);
          } finally {
            setLoadingWatchlist(false);
          }

          // Fetch user's personal rating
          try {
            const fetchedUserRating = await fetchUserRatingForMovie(foundMovie.id);
            setUserRating(fetchedUserRating ? fetchedUserRating.ratingValue : null);
          } catch (ratingError) {
            console.error("Error fetching user rating:", ratingError);
          }

          // Fetch average rating
          try {
            const fetchedAverageRating = await fetchAverageRatingForMovie(foundMovie.id);
            setAverageRating(fetchedAverageRating);
          } catch (avgRatingError) {
            console.error("Error fetching average rating:", avgRatingError);
          } finally {
            setLoadingRating(false); // Finish loading for ratings
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

    getMovieAndRatings();
  }, [movieId]);

  const handleToggleWatchlist = async () => {
    if (!movie || loadingWatchlist) return;

    setLoadingWatchlist(true);
    try {
      if (isInWatchlist) {
        await removeMovieFromWatchlist(movie.id);
        setIsInWatchlist(false);
        toast.success(`'${movie.title}' removed from watchlist!`);
      } else {
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
      setLoadingWatchlist(false);
    }
  };

  // New: Handle rating submission
  const handleRatingSubmit = async (rating: number) => {
    if (!movie || submittingRating) return;

    setSubmittingRating(true);
    try {
      await addOrUpdateRating(movie.id, rating);
      setUserRating(rating); // Update UI with new user rating
      toast.success(`You rated '${movie.title}' ${rating}/10!`);
      // Re-fetch average rating after user submits their rating
      const updatedAverageRating = await fetchAverageRatingForMovie(movie.id);
      setAverageRating(updatedAverageRating);
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      const errorMessage = error.response?.data || "Failed to submit rating.";
      toast.error(errorMessage);
    } finally {
      setSubmittingRating(false);
    }
  };

  // New: Function to render star rating input
  const renderStarRatingInput = () => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-6 w-6 cursor-pointer transition-colors duration-150
            ${userRating !== null && i <= userRating ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-300'}`}
          onClick={() => handleRatingSubmit(i)}
          fill={userRating !== null && i <= userRating ? 'currentColor' : 'none'}
        />
      );
    }
    return (
      <div className="flex space-x-1">
        {stars}
      </div>
    );
  };

  // New: Function to render average rating stars
  const renderAverageRatingStars = (avg: number | null) => {
    if (avg === null) return null;
    const fullStars = Math.floor(avg / 2); // Assuming 1-10 rating, convert to 1-5 stars
    const hasHalfStar = (avg % 2) >= 1; // Check if there's a half star

    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-5 w-5 text-yellow-400" fill="currentColor" />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-5 w-5 text-yellow-400" fill="currentColor" />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-5 w-5 text-gray-500" />);
    }
    return <div className="flex items-center space-x-0.5">{stars}</div>;
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
              <span className="font-semibold text-gray-300">Original Rating:</span> {movie.rating} / 10
            </p>
          )}
        </div>

        {/* New: User Rating Section */}
        <div className="mb-8 p-4 bg-gray-700 rounded-lg border border-gray-600">
          <h3 className="text-2xl font-bold text-red-500 mb-4">Your Rating</h3>
          {loadingRating ? (
            <p className="text-gray-400">Loading your rating...</p>
          ) : (
            <>
              <div className="flex items-center space-x-4 mb-4">
                <p className="text-lg text-gray-300">Rate this movie (1-10):</p>
                {renderStarRatingInput()}
              </div>
              {userRating !== null && (
                <p className="text-lg text-gray-300">
                  You rated this movie: <span className="font-bold text-yellow-400">{userRating}/10</span>
                </p>
              )}
            </>
          )}
          {submittingRating && <p className="text-sm text-gray-400 mt-2">Submitting rating...</p>}
        </div>

        {/* New: Average Rating Section */}
        <div className="mb-8 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <h3 className="text-2xl font-bold text-red-500 mb-4">Community Rating</h3>
            {loadingRating ? (
                <p className="text-gray-400">Loading average rating...</p>
            ) : (
                <>
                    {averageRating !== null ? (
                        <div className="flex items-center space-x-2">
                            <p className="text-lg text-gray-300">Average Rating:</p>
                            <span className="font-bold text-yellow-400 text-xl">
                                {averageRating.toFixed(1)}/10
                            </span>
                            {renderAverageRatingStars(averageRating)}
                        </div>
                    ) : (
                        <p className="text-lg text-gray-400">No ratings yet. Be the first to rate!</p>
                    )}
                </>
            )}
        </div>

        {/* Similar Movies Section */}
        {movie.genre && (
          <SimilarMoviesSection
            genre={movie.genre}
            currentMovieId={movie.id}
            title={`More like "${movie.title}"`}
          />
        )}
      </div>
    </div>
  );
}
