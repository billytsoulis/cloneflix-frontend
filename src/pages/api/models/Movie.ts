// src/pages/api/models/Movie.ts

import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for a Movie document, extending Mongoose's Document
// This provides type safety for our Movie model.
export interface IMovie extends Document {
  id: number;
  title: string;
  genre: string;
  release_year: number;
  director?: string;
  rating?: number;
  description?: string;
  poster_url?: string; // New field for the poster URL
  trailer_url?: string; // New field for the trailer URL
}

// Define the Mongoose schema for the Movie document.
// This schema will enforce the structure of our movie data in the MongoDB collection.
const MovieSchema: Schema = new Schema({
  // The movie ID from the original CSV, we will keep it for now for consistency
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  release_year: {
    type: Number,
    required: true,
  },
  director: {
    type: String,
  },
  rating: {
    type: Number,
  },
  description: {
    type: String,
  },
  poster_url: {
    type: String,
  },
  trailer_url: {
    type: String,
  },
});

// Create the Mongoose model.
// Mongoose.models.Movie checks if the model has already been compiled,
// which is necessary in Next.js to avoid re-compiling the model on hot reloads.
const Movie = mongoose.models.Movie || mongoose.model<IMovie>('Movie', MovieSchema);

export default Movie;
