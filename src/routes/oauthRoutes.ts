/**
 * oauthRoutes.ts
 *
 * Google OAuth 2.0 Routes
 * Handles the full login process:
 *  - GET /auth/google              → Redirect to Google Consent Screen
 *  - GET/POST /auth/google/callback → Google returns the authorization code
 */

import { Router } from "express";
import { googleLogin, oauthCallback } from "../controllers/oauthController";

const router = Router();

/**
 * GET /auth/google
 * Step 1 — Redirect user to Google consent page.
 */
router.get("/google", googleLogin);

/**
 * GET /auth/google/callback
 * Step 2 — Google redirects back with ?code=...
 */
router.get("/google/callback", oauthCallback);

/**
 * POST /auth/google/callback
 * Optional — Some OAuth providers may return POST.
 */
router.post("/google/callback", oauthCallback);

export default router;
