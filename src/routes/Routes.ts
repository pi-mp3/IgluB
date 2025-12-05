/**
 * routes.ts
 *
 * Centralized route aggregator for the Iglu backend.
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
 */
router.use('/recover', recoverPasswordRoutes);
router.use('/user', resetPasswordRoutes);

export default router;
