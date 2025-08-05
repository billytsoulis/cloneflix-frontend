// app/api/movies/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const movies = await db.collection('movies').find().toArray();
    return NextResponse.json({ movies }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch movies from MongoDB:", error);
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
  }
}
