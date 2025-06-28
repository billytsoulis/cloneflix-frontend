// frontend/src/app/lib/api.ts
import axios from "axios";

// Create an Axios instance with a base URL.
// This URL will be pulled from the .env.local file.
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // IMPORTANT: Allows sending and receiving cookies
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
  // No need to store the token in localStorage here.
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
