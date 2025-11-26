/**
 * resetPassword.routes.ts
 * 
 * Routes for password reset (after user clicks link)
 * 
 * @module routes/resetPassword
 */

import { Router } from 'express';
import { resetPassword } from '../controllers/resetPassword.controller';

const router = Router();

/**
 * POST /api/user/reset-password
 * Reset password using token from email
 */
router.post('/reset-password', resetPassword);

export default router;
