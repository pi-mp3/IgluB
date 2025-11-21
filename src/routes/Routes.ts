/**
 * routes.ts
 * 
 * Centralized routes for the Iglu backend.
 * Combines authentication, user management, OAuth, and other feature routes.
 * 
 * @module routes
 */

import { Router } from 'express';
import userRoutes from './register.routes';
import oauthRoutes from './oauthRoutes';
import facebookRoutes from './facebookRoutes';
import editUserRoutes from './editUser.routes';
import deleteUserRoutes from './deleteUser.routes';
import recoverPasswordRoutes from './recoverPassword.routes';
import chatRoutes from './chat.routes';
import meetingRoutes from './meeting.routes';

/**
 * Main router instance.
 * @type {Router}
 */
const router = Router();

// =======================
// Authentication routes
// =======================
/**
 * Handles manual registration, login, Google/Facebook OAuth login, and logout
 * Base path: /auth
 */
router.use('/auth', userRoutes);
router.use('/auth', oauthRoutes);
router.use('/auth', facebookRoutes);

// =======================
// User management routes
// =======================
/**
 * Handles editing, deleting, and recovering user accounts
 * Base path: /user
 */
router.use('/user', editUserRoutes);
router.use('/user', deleteUserRoutes);
router.use('/user', recoverPasswordRoutes);

// =======================
// Chat routes
// =======================
/**
 * Handles retrieving chat messages
 * Base path: /chat
 */
router.use('/chat', chatRoutes);

// =======================
// Meeting routes
// =======================
/**
 * Handles creating meetings
 * Base path: /meeting
 */
router.use('/meeting', meetingRoutes);

export default router;
