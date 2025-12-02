/**
 * routes.ts
 *
 * Centralized route aggregator for the Iglu backend.
 * Imports and mounts all feature modules under the main API prefix.
 *
 * @module routes
 */

import { Router } from 'express';

// Rutas de autenticación
import userRoutes from './register.routes';       // Registro / login
import oauthRoutes from './oauthRoutes';          // Google OAuth
import facebookRoutes from './facebookRoutes';    // Facebook OAuth
import logoutRoutes from './logout.routes';       // Logout

// Rutas de manejo de usuario
import editUserRoutes from './editUser.routes';     // Editar usuario
import deleteUserRoutes from './deleteUser.routes'; // Eliminar usuario
import getUserRoutes from './getUser.routes';

// Rutas de recuperación y reset de contraseña
import recoverPasswordRoutes from './recoverPassword.routes';
import resetPasswordRoutes from './resetPassword.routes';


const router = Router();

/**
 * Authentication routes
 */
router.use('/auth', userRoutes);
router.use('/auth', oauthRoutes);
router.use('/auth', facebookRoutes);
router.use('/auth', logoutRoutes);

/**
 * User management routes
 */
router.use('/user', editUserRoutes);
router.use('/user', deleteUserRoutes);
router.use('/user', getUserRoutes);

/**
 * Password recovery routes
 */
router.use('/recover', recoverPasswordRoutes);
router.use('/user', resetPasswordRoutes);

export default router;
