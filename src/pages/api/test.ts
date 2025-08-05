// src/pages/api/test.ts

import { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '@/lib/connectMongo';
import Movie from './models/Movie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('API call received for /api/test');
    
    // First, connect to the database using our utility function
    await connectMongo();
    console.log('MongoDB connection established successfully.');

    // Count the number of movies to check if the database is empty
    const movieCount = await Movie.countDocuments({});

    // If no movies are found, create a new one as a test
    if (movieCount === 0) {
      console.log('No movies found. Creating a test movie...');
      const testMovie = {
        id: 999, // A unique ID for our test movie
        title: 'Test Movie',
        genre: 'Test Genre',
        release_year: 2023,
        description: 'This is a test movie to verify the MongoDB connection.',
        poster_url: 'https://placehold.co/400x600/000000/FFFFFF?text=Test+Movie',
        trailer_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rickroll link for fun
      };

      const newMovie = await Movie.create(testMovie);
      console.log('Test movie created successfully:', newMovie);
      
      // Respond with a success message and the new movie count
      return res.status(201).json({
        message: 'MongoDB is connected and a test movie was created!',
        movieCount: movieCount + 1,
      });
    }

    // If movies are already present, just confirm the connection and return the count
    return res.status(200).json({
      message: 'MongoDB is connected and contains existing data.',
      movieCount,
    });
  } catch (error: any) {
    console.error('API Test Error:', error);
    // On failure, return a 500 status with the error message
    return res.status(500).json({ error: 'Failed to connect to MongoDB or process the request.', details: error.message });
  }
}
