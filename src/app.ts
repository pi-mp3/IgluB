/**
 * app.ts
 * 
 * Main Express configuration for the Iglu backend.
 * Sets up middlewares and main routes using a centralized router.
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/Routes';
import path from 'path';
dotenv.config();
console.log(" Working directory:", process.cwd());
console.log(" Looking for package.json at:", path.resolve("package.json"));

const app = express();

// =======================
// Middlewares
// =======================

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://iglu-f-4mku.vercel.app"
    
  ],
  credentials: true,
}));

app.use(express.json());

// =======================
// Routes
// =======================

app.use('/api', router);

// =======================
// Root route
// =======================

app.get('/', (req: Request, res: Response) => {
  res.send('Iglu Backend is running');
});

export default app;