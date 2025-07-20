// frontend/src/app/movies/[id]/page.tsx

"use client"; // This is a client component

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAllMovies, Movie } from '@/lib/api'; // Import fetchAllMovies and Movie interface
import toast from 'react-hot-toast'; // For notifications
import Link from 'next/link'; // Import Link for navigation

interface MovieDetailsPageProps {
  params: Promise<{
    id: string; // The movie ID from the URL will be a string
  }>;
}

export default function MovieDetailsPage({ params: paramsPromise }: MovieDetailsPageProps) {
  // Unwrap the params promise using React.use()
  const params = use(paramsPromise);
  const router = useRouter();
  const movieId = parseInt(params.id, 10); // Parse the ID from string to number

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        // For simplicity, we'll fetch all movies and then find the specific one.
        // In a real application, you'd have a dedicated API endpoint like
        // fetchMovieById(movieId) from your FastAPI backend.
        // For now, FastAPI's get_movie_by_id is available, but fetchAllMovies
        // is already implemented on the frontend.
        const allMovies = await fetchAllMovies(); // This fetches all movies
        const foundMovie = allMovies.find(m => m.id === movieId);

        if (foundMovie) {
          setMovie(foundMovie);
          setError(null);
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
    // This case should ideally be caught by the error handling above,
    // but as a fallback for robustness.
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
        <Link href="/" passHref>
          <button className="mb-6 px-4 py-2 text-md font-semibold rounded-md bg-gray-700 hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900">
            &larr; Back to Movies
          </button>
        </Link>

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

        {/* You can add more sections here, e.g., "Related Movies", "Cast", etc. */}
      </div>
    </div>
  );
}
