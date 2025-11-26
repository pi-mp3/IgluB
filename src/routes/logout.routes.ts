// src/routes/logout.routes.ts
/**
 * Rutas para logout
 */

import { Router } from 'express';
import { logoutUser } from '../controllers/logout.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /auth/logout
 * Requiere JWT válido en Authorization header
 */
router.post('/logout', authenticateJWT, logoutUser);

export default router;
