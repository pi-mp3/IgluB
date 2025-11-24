/**
 * facebookRoutes.ts
 * 
 * Routes for Facebook OAuth login.
 * 
 * @module routes/facebookRoutes
 */

import { Router } from 'express';
import { facebookOAuthCallback } from '../controllers/facebookOAuth.controller';

const router = Router();

/**
 * Route to handle Facebook OAuth login
 * POST /callback
 */
router.post('/callback', facebookOAuthCallback);

export default router;
