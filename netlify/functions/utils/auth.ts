import { jwtVerify, createRemoteJWKSet } from 'jose';
import type { HandlerEvent } from "@netlify/functions";

// IMPORTANT: These must be set in your Netlify environment variables
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;
const AUTH0_ISSUER_BASE_URL = process.env.AUTH0_ISSUER_BASE_URL;

if (!AUTH0_AUDIENCE || !AUTH0_ISSUER_BASE_URL) {
  throw new Error('Auth0 environment variables AUTH0_AUDIENCE and AUTH0_ISSUER_BASE_URL must be set.');
}

const jwks = createRemoteJWKSet(new URL(`${AUTH0_ISSUER_BASE_URL}.well-known/jwks.json`));

/**
 * Validates the Authorization Bearer token from a Netlify function event.
 * @param event The Netlify function handler event.
 * @returns An object with either the decoded user payload or an error and status code.
 */
export const validateToken = async (event: HandlerEvent) => {
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Authorization header is missing or invalid.', status: 401 };
  }
  const token = authHeader.split(' ')[1];
  
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: AUTH0_ISSUER_BASE_URL,
      audience: AUTH0_AUDIENCE,
    });
    return { user: payload, error: null, status: 200 };
  } catch (error) {
    console.error('Token validation failed:', error);
    return { user: null, error: 'Invalid or expired token.', status: 401 };
  }
};