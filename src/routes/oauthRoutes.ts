/**
 * oauthRoutes.ts
 *
 * Routes for Google OAuth authentication.
 * Includes login URL generation and callback processing.
 *
 * @module routes/oauthRoutes
 */

import { Router } from 'express';
import { oauthCallback, googleClient } from '../controllers/oauthController';

const router = Router();

/**
 * Starts Google OAuth login process.
 * Redirects user to Google’s authentication page.
 *
 * GET /api/auth/google
 */
router.get('/google', (req, res) => {
  // Generate the Google login URL using OAuth2 client
  const redirectUrl = googleClient.generateAuthUrl({
    access_type: 'offline', // Necesario para refresh_token
    prompt: 'consent',      // Fuerza a Google a entregar refresh_token
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
  });

  // Redirect user to Google login page
  res.redirect(redirectUrl);
});

/**
 * Google OAuth callback route.
 * Handles authorization code returned by Google and returns user data.
 *
 * GET /api/auth/google/callback
 */
router.get('/google/callback', oauthCallback);

export default router;
