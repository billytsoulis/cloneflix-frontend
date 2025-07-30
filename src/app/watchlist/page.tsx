// frontend/src/app/watchlist/page.tsx

"use client"; // This is a client component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { fetchWatchlist, WatchlistItem, Movie } from '@/lib/api'; // Import fetchWatchlist and WatchlistItem type
import MovieCard from '@/components/MovieCard'; // Re-use MovieCard for display
import Link from 'next/link';

export default function WatchlistPage() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getWatchlist = async () => {
      try {
        setLoading(true);
        const fetchedWatchlist = await fetchWatchlist();
        setWatchlist(fetchedWatchlist);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching watchlist:", err);
        setError(err.response?.data || "Failed to load watchlist. Please log in again.");
        toast.error("Failed to load watchlist. Please log in.");
        router.push('/login'); // Redirect to login if fetching watchlist fails (e.g., unauthorized)
      } finally {
        setLoading(false);
      }
    };

    getWatchlist();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
        <p className="ml-4 text-xl">Loading your watchlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900 text-white font-inter">
        <p className="text-center text-red-400 text-lg mb-4">{error}</p>
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
    <div className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white font-inter">
      <div className="w-full max-w-6xl text-center mb-8">
        <h1 className="text-5xl font-bold text-red-600 mb-4">My Watchlist</h1>
        <p className="text-xl text-gray-300">
          Movies you've saved to watch later.
        </p>
      </div>

      {watchlist.length === 0 ? (
        <div className="text-center text-gray-400 text-lg mt-8">
          <p className="mb-4">Your watchlist is empty.</p>
          <p>Start adding movies from the <Link href="/" className="text-red-500 hover:underline">home page</Link>!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {watchlist.map((item) => (
            // Convert WatchlistItem to Movie type for MovieCard component
            <MovieCard
              key={item.id} // Use watchlist item ID as key
              movie={{
                id: item.movieId,
                title: item.movieTitle,
                genre: item.movieGenre,
                release_year: 0, // Placeholder, as WatchlistItem doesn't store year
                // You might want to fetch full movie details here if needed,
                // or update your WatchlistItem model to store more details.
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
