// lib/db.ts
import { MongoClient, Db } from 'mongodb';

// Ensure the MONGO_URI environment variable is set
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// This function will establish a connection to the MongoDB database
export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(uri!);
  const db = client.db("movies"); // "movies" is your database name

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
