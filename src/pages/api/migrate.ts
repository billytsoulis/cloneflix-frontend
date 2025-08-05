// src/pages/api/migrate.ts

import { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '@/lib/connectMongo';
import Movie from './models/Movie';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This API route will only handle GET requests to prevent accidental data migration
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    console.log('Starting data migration from movies.csv to MongoDB...');
    
    // Connect to the MongoDB database
    await connectMongo();

    // Check if the database already contains movies, to prevent duplicate entries.
    const movieCount = await Movie.countDocuments({});
    if (movieCount > 0) {
      console.log('Movies already exist in the database. Migration aborted.');
      return res.status(200).json({
        message: 'Database is already populated. Migration not needed.',
        movieCount: movieCount,
      });
    }

    const movies: any[] = [];
    // Define the path to the movies.csv file
    // The path is adjusted to go one directory up from the current working directory (the 'frontend' folder)
    // to find the 'movies.csv' file in the project root.
    const filePath = path.join(process.cwd(), 'movies.csv');

    // Create a promise to handle the stream-based CSV parsing
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          // Parse the data from the CSV file
          const movieData = {
            id: parseInt(data.id, 10),
            title: data.title,
            genre: data.genre,
            release_year: parseInt(data.release_year, 10),
            director: data.director || null,
            rating: parseFloat(data.rating) || null,
            description: data.description || null,
          };
          movies.push(movieData);
        })
        .on('end', () => {
          console.log('CSV file successfully processed.');
          resolve();
        })
        .on('error', (error) => {
          console.error('Error reading CSV file:', error);
          reject(error);
        });
    });

    // Insert all the parsed movies into the MongoDB database in a single operation
    const result = await Movie.insertMany(movies);
    console.log(`Successfully migrated ${result.length} movies into MongoDB.`);

    return res.status(200).json({
      message: 'Data migration successful!',
      migratedCount: result.length,
    });
  } catch (error: any) {
    console.error('Migration failed:', error);
    // On failure, return a 500 status with the error message
    return res.status(500).json({ error: 'Data migration failed.', details: error.message });
  }
}
