/**
 * facebookRoutes.ts
 * 
 * Routes for Facebook OAuth login.
 * 
 * @module routes/facebookRoutes
 */

import { Router } from 'express';
import { facebookCallback } from '../controllers/facebookOAuth.controller'; // ⚠️ Nombre corregido

const router = Router();

/**
 * Route to handle Facebook OAuth login
 * POST /callback
 */
router.post('/callback', facebookCallback);

export default router;
