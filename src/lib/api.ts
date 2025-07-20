// frontend/src/app/lib/api.ts
import axios from "axios";

// Create an Axios instance with a base URL for the Spring Boot Auth Service.
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // IMPORTANT: Allows sending and receiving cookies
});

// Create a separate Axios instance for the FastAPI Recommendation Engine.
// This assumes FastAPI is running on a different port, e.g., 8000.
const RECOMMENDATION_API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RECOMMENDATION_API_BASE_URL || "http://localhost:8000",
  withCredentials: true, // Include credentials if FastAPI might use them later (e.g., for user-specific recommendations)
});


/**
 * Registers a new user with the backend authentication service.
 * @param data - An object containing user's email and password.
 * @returns A promise that resolves to the API response.
 */
export const registerUser = async (data: {
  email: string;
  password: string;
}) => {
  // Sends a POST request to the registration endpoint.
  return API.post("/api/auth/register", data);
};

/**
 * Logs in an existing user. The JWT token will be set as an HttpOnly cookie by the backend.
 * @param data - An object containing user's email and password.
 * @returns A promise that resolves to the API response.
 */
export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  // Sends a POST request to the login endpoint.
  // The backend is responsible for setting the HttpOnly cookie.
  return API.post("/api/auth/login", data);
};

/**
 * Logs out the current user by sending a request to the backend.
 * The backend is responsible for clearing the HttpOnly cookie.
 * @returns A promise that resolves to the API response.
 */
export const logoutUser = async () => {
    return API.post("/api/auth/logout");
};

// --- API Call for Recommendation Engine ---

// Define a type for the Movie object from FastAPI
export interface Movie {
  id: number;
  title: string;
  genre: string;
  release_year: number;
  director?: string; // Optional property
  rating?: number;    // New optional property from CSV
  description?: string; // New optional property from CSV
}

/**
 * Fetches all movies from the FastAPI Recommendation Engine.
 * @returns A promise that resolves to a list of Movie objects.
 */
export const fetchAllMovies = async (): Promise<Movie[]> => {
  try {
    // The FastAPI endpoint is under /api/v1/movies/
    const response = await RECOMMENDATION_API.get<Movie[]>("/api/v1/movies/");
    return response.data;
  } catch (error) {
    console.error("Error fetching all movies:", error);
    throw error; // Re-throw to be handled by the calling component
  }
};

/**
 * Fetches movie recommendations from the FastAPI Recommendation Engine.
 * @param userId - Optional user ID for personalized recommendations (future use).
 * @returns A promise that resolves to a list of recommended Movie objects.
 */
export const fetchMovieRecommendations = async (userId?: number): Promise<Movie[]> => {
  try {
    const params = userId ? { user_id: userId } : {};
    const response = await RECOMMENDATION_API.get<Movie[]>("/api/v1/movies/recommendations/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching movie recommendations:", error);
    throw error; // Re-throw to be handled by the calling component
  }
};

// You can add an interceptor here to automatically handle common errors,
// e.g., redirecting to login if a 401 Unauthorized is received for non-auth endpoints.
// API.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401 && error.config.url !== "/api/auth/login") {
//       // Handle unauthorized access, e.g., redirect to login page
//       // window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );
