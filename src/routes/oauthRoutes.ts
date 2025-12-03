/**
 * oauthRoutes.ts
 *
 * Handles Google OAuth 2.0 login flow.
 */

import { Router } from "express";
import { googleLogin, oauthCallback } from "../controllers/oauthController";

const router = Router();

/**
 * GET /api/auth/google
 * Step 1 — Redirect user to Google consent screen
 */
router.get("/google", googleLogin);

/**
 * Google OAuth callback
 * GET /api/auth/google/callback
 * POST /api/auth/google/callback
 */
router.get("/google/callback", oauthCallback);
router.post("/google/callback", oauthCallback);

export default router;
