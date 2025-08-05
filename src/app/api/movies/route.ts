import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Define the cached connection object
// This is a crucial optimization for Next.js API routes to prevent
// reconnecting on every request.
const cached: { conn: any | null, promise: Promise<any> | null } = {
  conn: null,
  promise: null,
};

// Function to establish a MongoDB connection
async function connectToDatabase() {
  // Check if we have a cached connection
  if (cached.conn) {
    return cached.conn;
  }

  // If a promise already exists for a connection, use it
  if (!cached.promise) {
    // Ensure MONGODB_URI is available
    if (!process.env.MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }

    // Connect to the database and cache the connection promise
    cached.promise = mongoose.connect(process.env.MONGODB_URI!, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Define the Mongoose schema for a Movie
const movieSchema = new mongoose.Schema({
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
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

// Check if the model already exists before defining it
const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema, 'movies');

// The GET handler for the API route
export async function GET() {
  try {
    // 1. Connect to the MongoDB database
    await connectToDatabase();

    // 2. Fetch all movies from the "movies" collection
    const movies = await Movie.find({});

    // 3. Return the movies as a JSON response
    return NextResponse.json(movies);

  } catch (error) {
    console.error("Error fetching movies:", error);
    // 4. Handle errors and return a server error response
    return NextResponse.json(
      { error: 'Failed to fetch movies from the database.' },
      { status: 500 }
    );
  }
}
