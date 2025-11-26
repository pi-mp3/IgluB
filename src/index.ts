/**
 * index.ts
 * 
 * Entry point of the Express server.
 * Starts the application on the port defined in .env or 3001 by default.
 * 
 * @module index
 */

import app from './app';

/** Server port, taken from environment variable or default to 3001 */
const PORT = process.env.PORT || 3001;

/**
 * Starts the Express server and listens for HTTP requests
 */
app.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
});
