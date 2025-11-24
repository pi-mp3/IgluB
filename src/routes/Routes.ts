/**
 * routes.ts
 *
 * Centralized route aggregator for the Iglu backend.
 * Imports and mounts all feature modules under the main API prefix.
 *
 * @module routes
 */

import { Router } from 'express';

import userRoutes from './register.routes';
import oauthRoutes from './oauthRoutes'; // Google OAuth
import facebookRoutes from './facebookRoutes';
import editUserRoutes from './editUser.routes';
import deleteUserRoutes from './deleteUser.routes';
import recoverPasswordRoutes from './recoverPassword.routes';

const router = Router();

/**
 * Authentication routes (register, login, Google OAuth, Facebook auth)
 */
router.use('/auth', userRoutes);
router.use('/auth', oauthRoutes);
router.use('/auth', facebookRoutes);

/**
 * User management routes
 */
router.use('/user', editUserRoutes);
router.use('/user', deleteUserRoutes);

/**
 * Password recovery route
 */
router.use('/recover', recoverPasswordRoutes);

export default router;
