/**
 * recoverPassword.routes.ts
 * 
 * Routes for password recovery (request reset email)
 * 
 * @module routes/recoverPassword
 */

import { Router } from 'express';
import { recoverPassword } from '../controllers/recoverPassword.controller';

const router = Router();

/**
 * POST /api/recover/user/recover-password
 * Request password recovery email
 */
router.post('/user/recover-password', recoverPassword);

export default router;
