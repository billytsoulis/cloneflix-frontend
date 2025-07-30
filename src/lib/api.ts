// frontend/src/app/lib/api.ts
import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

const RECOMMENDATION_API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RECOMMENDATION_API_BASE_URL || "http://localhost:8000",
  withCredentials: true,
});


export const registerUser = async (data: {
  email: string;
  password: string;
}) => {
  return API.post("/api/auth/register", data);
};

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  return API.post("/api/auth/login", data);
};

export const logoutUser = async () => {
    return API.post("/api/auth/logout");
};

export interface Movie {
  id: number;
  title: string;
  genre: string;
  release_year: number;
  director?: string;
  rating?: number;
  description?: string;
}

export const fetchAllMovies = async (): Promise<Movie[]> => {
  try {
    const response = await RECOMMENDATION_API.get<Movie[]>("/api/v1/movies/");
    return response.data;
  } catch (error) {
    console.error("Error fetching all movies:", error);
    throw error;
  }
};

/**
 * Fetches movie recommendations from the FastAPI Recommendation Engine.
 * @param userId - Optional user ID for personalized recommendations (future use).
 * @param genre - Optional genre to filter recommendations by.
 * @returns A promise that resolves to a list of recommended Movie objects.
 */
export const fetchMovieRecommendations = async (userId?: number, genre?: string): Promise<Movie[]> => {
  try {
    const params: { [key: string]: any } = {}; // Use index signature for dynamic keys
    if (userId !== undefined) {
      params.user_id = userId;
    }
    if (genre !== undefined) {
      params.genre = genre;
    }
    const response = await RECOMMENDATION_API.get<Movie[]>("/api/v1/movies/recommendations/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching movie recommendations:", error);
    throw error;
  }
};

export interface UserProfile {
  id: number;
  email: string;
}

export const fetchUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await API.get<UserProfile>("/api/auth/profile");
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (data: { email?: string; password?: string }) => {
  try {
    const response = await API.put("/api/auth/profile", data);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// --- New API Calls for Watchlist Management ---

export interface WatchlistItem {
  id: number;
  movieId: number;
  movieTitle: string;
  movieGenre: string;
  addedAt: string;
}

export const addMovieToWatchlist = async (movieId: number, movieTitle: string, movieGenre: string): Promise<WatchlistItem> => {
  try {
    const response = await API.post<WatchlistItem>("/api/watchlist/add", { movieId, movieTitle, movieGenre });
    return response.data;
  } catch (error) {
    console.error("Error adding movie to watchlist:", error);
    throw error;
  }
};

export const removeMovieFromWatchlist = async (movieId: number) => {
  try {
    const response = await API.delete("/api/watchlist/remove", { data: { movieId } });
    return response.data;
  } catch (error) {
    console.error("Error removing movie from watchlist:", error);
    throw error;
  }
};

export const fetchWatchlist = async (): Promise<WatchlistItem[]> => {
  try {
    const response = await API.get<WatchlistItem[]>("/api/watchlist/");
    return response.data;
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    throw error;
  }
};

export const checkMovieInWatchlist = async (movieId: number): Promise<boolean> => {
  try {
    const response = await API.get<boolean>(`/api/watchlist/check/${movieId}`);
    return response.data;
  } catch (error) {
    console.error(`Error checking movie ID ${movieId} in watchlist:`, error);
    return false;
  }
};

// --- New API Call for Movie Search ---

/**
 * Searches for movies by a given query string (title or genre).
 * Sends a GET request to /api/v1/movies/search/.
 * @param query - The search string.
 * @returns A promise that resolves to a list of Movie objects matching the query.
 */
export const searchMovies = async (query: string): Promise<Movie[]> => {
  try {
    const response = await RECOMMENDATION_API.get<Movie[]>("/api/v1/movies/search/", { params: { query } });
    return response.data;
  } catch (error) {
    console.error(`Error searching movies for query '${query}':`, error);
    throw error;
  }
};
