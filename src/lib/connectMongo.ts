// src/pages/api/lib/connectMongo.ts

import mongoose from 'mongoose';

// A global variable to cache the MongoDB connection.
// This is crucial for Next.js to prevent creating new connections on every hot reload.
let cachedConnection: any = null;

// The function to connect to the MongoDB database.
// It will be called from our API routes.
export default async function connectMongo() {
  // If a connection is already cached, return it to avoid unnecessary new connections.
  if (cachedConnection) {
    console.log('Using cached MongoDB connection.');
    return cachedConnection;
  }

  // Define the MongoDB connection URI from the environment variables.
  // This is a best practice to keep sensitive credentials out of the codebase.
  const uri = process.env.MONGODB_URI;

  // Check if the URI is defined. If not, throw an error to prevent the application from starting without credentials.
  if (!uri) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    );
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    // Establish a new connection to the database using Mongoose.
    const connection = await mongoose.connect(uri);

    // Cache the new connection and return it.
    cachedConnection = connection;
    console.log('MongoDB connection successful!');

    return connection;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    // Throw the error so the API route can handle it.
    throw error;
  }
}
