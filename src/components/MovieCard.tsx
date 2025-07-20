// frontend/src/app/components/MovieCard.tsx

import React from 'react';
import Link from 'next/link'; // Import Link from next/link
import { Movie } from '../lib/api'; // Import the Movie interface

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    // Wrap the card content with a Next.js Link component
    // This will navigate to /movies/[id] when clicked
    <Link href={`/movies/${movie.id}`} passHref>
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl border border-gray-700 cursor-pointer">
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
      </div>
    </Link>
  );
};

export default MovieCard;
