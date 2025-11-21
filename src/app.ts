/**
 * app.ts
 * 
 * Main Express configuration for the Iglu backend.
 * Sets up middlewares and main routes.
 * 
 * @module app
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './routes/register.routes';
import oauthRoutes from './routes/oauthRoutes';
import facebookRoutes from './routes/facebookRoutes';
import editUserRoutes from './routes/editUser.routes';
import deleteUserRoutes from './routes/deleteUser.routes';
import recoverPasswordRoutes from './routes/recoverPassword.routes';

dotenv.config();

/** 
 * Express application instance
 * @type {express.Application} 
 */
const app = express();

// =======================
// Middlewares
// =======================

/**
 * CORS middleware
 * Allows requests from any origin
 */
app.use(cors());

/**
 * Middleware to parse JSON in incoming requests
 */
app.use(express.json());

// =======================
// Routes
// =======================

/**
 * Authentication routes
 * Base path: /api/auth
 * Routes included: register, login, login/google, login/facebook, logout
 */
app.use('/api/auth', userRoutes);
app.use('/api/auth', oauthRoutes);
app.use('/api/auth', facebookRoutes);

/**
 * User management routes
 * Base path: /api/user
 * Routes included: edit account, delete account, recover password
 */
app.use('/api/user', editUserRoutes);
app.use('/api/user', deleteUserRoutes);
app.use('/api/user', recoverPasswordRoutes);

/**
 * Export the app to be used in index.ts
 */
export default app;
