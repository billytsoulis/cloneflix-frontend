// frontend/src/app/lib/auth.ts

import { NextRequest, NextResponse } from 'next/server';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Buffer } from 'buffer'; // Import Buffer for Base64 decoding

// Get the JWT secret from environment variables.
// This MUST match the secret used by your Spring Boot application.
const JWT_SECRET_BASE64 = process.env.JWT_SECRET;
const ALGORITHM = 'HS256'; // Ensure this matches your Spring Boot JWT algorithm

// Decode the Base64 secret string into a Buffer, as jsonwebtoken expects raw bytes or a string.
// This ensures compatibility with the Base64-encoded secret from Spring Boot.
let JWT_SECRET_BUFFER: Buffer | null = null;
if (JWT_SECRET_BASE64) {
  try {
    JWT_SECRET_BUFFER = Buffer.from(JWT_SECRET_BASE64, 'base64');
  } catch (e) {
    console.error('Error decoding JWT_SECRET from Base64. Please check your .env.local file.', e);
    // Set to null to ensure validation fails if secret is malformed
    JWT_SECRET_BUFFER = null;
  }
} else {
  console.error('JWT_SECRET environment variable is not set. Authentication will fail.');
}


/**
 * Checks if a user is authenticated by directly validating their JWT token from the cookie.
 * This function is intended to be used in Next.js API routes to protect them.
 *
 * @param request The incoming NextRequest object, from which cookies can be read.
 * @returns A Promise that resolves to true if the user is authenticated, false otherwise.
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  // Get the JWT token from the 'jwt' cookie.
  const jwtToken = request.cookies.get('jwt')?.value;

  // If no JWT token is found, the user is not authenticated.
  if (!jwtToken) {
    console.log('Authentication check: No JWT token found in cookies.');
    return false;
  }

  // If the secret is not properly configured, we cannot validate.
  if (!JWT_SECRET_BUFFER) {
    console.error('Authentication check: JWT_SECRET is not configured or invalid. Cannot validate token.');
    return false;
  }

  try {
    // Directly verify the JWT token using the shared secret.
    // The 'sub' (subject) claim typically holds the username/email.
    const decoded = jwt.verify(jwtToken, JWT_SECRET_BUFFER, { algorithms: [ALGORITHM] });
    
    // You can optionally log the decoded payload for debugging (remove in production)
    // console.log('Authentication check: JWT token decoded successfully:', decoded);

    console.log('Authentication check: JWT token validated successfully.');
    return true; // Token is valid
  } catch (error: any) {
    if (error instanceof TokenExpiredError) {
      console.warn('Authentication check: JWT token expired.');
    } else if (error instanceof JsonWebTokenError) {
      console.warn(`Authentication check: Invalid JWT token: ${error.message}`);
    } else {
      console.error('Authentication check: An unexpected error occurred during JWT verification:', error);
    }
    return false; // Token is invalid or expired
  }
}
