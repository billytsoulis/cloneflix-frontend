import { NextResponse, NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { isAuthenticated } from '@/lib/auth'; // Import the new authentication utility

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
});

// Check if the model already exists before defining it
const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema, 'movies');

// The GET handler for the API route
export async function GET(request: NextRequest) {
  // First, check if the user is authenticated
  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    console.log('GET /api/movies/recommendations: Unauthorized access attempt.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Connect to the MongoDB database
    await connectToDatabase();

    // 2. Use the aggregation pipeline to fetch 5 random movies
    const recommendedMovies = await Movie.aggregate([
      { $sample: { size: 5 } }
    ]);

    // 3. Return the movies as a JSON response
    return NextResponse.json(recommendedMovies);

  } catch (error) {
    console.error("Error fetching recommended movies:", error);
    // 4. Handle errors and return a server error response
    return NextResponse.json(
      { error: 'Failed to fetch recommended movies from the database.' },
      { status: 500 }
    );
  }
}
