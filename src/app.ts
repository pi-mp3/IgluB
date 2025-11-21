/**
 * app.ts
 * 
 * Main Express configuration for the Iglu backend.
 * Sets up middlewares and main routes using a centralized router.
 * 
 * @module app
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/Routes'; // Centralized routes

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
 * Allows requests from the frontend at http://localhost:5173
 * Enables credentials (cookies, auth headers) if needed
 */
app.use(cors({
  origin: 'http://localhost:5173', // Change to your frontend URL if different
  credentials: true,
}));

/**
 * Middleware to parse JSON in incoming requests
 */
app.use(express.json());

// =======================
// Routes
// =======================

/**
 * Main API router
 * Base path: /api
 * All feature routes are centralized in routes.ts
 */
app.use('/api', router);

// =======================
// Root route (optional)
// =======================
app.get('/', (req, res) => {
  res.send('Iglu Backend is running');
});

/**
 * Export the app to be used in index.ts
 */
export default app;
