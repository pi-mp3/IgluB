/**
 * Routes.ts
 *
 * CENTRAL ROUTE AGGREGATOR FOR THE BACKEND
 * ---------------------------------------------------------
 * Provides a clean mounting of route groups. Comments in English.
 *
 * NOTE:
 * - The password reset routes are mounted under /recover to match frontend expectations:
 *   frontend expects POST /recover/user/send-reset-email and POST /recover/user/reset-password
 */

import { Router } from 'express';

// Auth
import userRoutes from './register.routes';
import oauthRoutes from './oauthRoutes';
import githubRoutes from './githubRoutes';
import logoutRoutes from './logout.routes';

// User mgmt
import editUserRoutes from './editUser.routes';
import deleteUserRoutes from './deleteUser.routes';
import getUserRoutes from './getUser.routes';

// Password recovery
import recoverPasswordRoutes from './recoverPassword.routes';
import resetPasswordRoutes from './resetPassword.routes';

const router = Router();

/**
 * Authentication routes
 */
router.use('/auth', userRoutes);
router.use('/auth', oauthRoutes);      // Google OAuth
router.use('/auth', githubRoutes);     // GitHub OAuth
router.use('/auth', logoutRoutes);

/**
 * User management
 */
router.use('/user', editUserRoutes);
router.use('/user', deleteUserRoutes);
router.use('/user', getUserRoutes);

/**
 * Password recovery
 *
 * Both recover (send email) and reset (submit new password) are mounted under /recover
 * so the frontend endpoints match:
 *  - POST /recover/user/send-reset-email
 *  - POST /recover/user/reset-password
 */
router.use('/recover', recoverPasswordRoutes);
router.use('/recover', resetPasswordRoutes); // <-- moved from /user to /recover

export default router;
