/**
 * oauthRoutes.ts
 * 
 * Routes for Google OAuth login.
 * 
 * @module routes/oauthRoutes
 */

import { Router } from 'express';
import { oauthCallback } from '../controllers/oauthController';

const router = Router();

/**
 * Route to handle Google OAuth redirect
 * GET /api/auth/google/callback
 */
router.get('/google/callback', oauthCallback);

export default router;
