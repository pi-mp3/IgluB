/**
 * google.routes.ts
 *
 * Google OAuth routes.
 * Only handles:
 *  - Redirect to Google
 *  - OAuth callback
 *
 * Logic is handled in oauthController.ts
 */

import { Router } from "express";
import {
  googleLogin,
  googleCallback,
} from "../controllers/oauthController";

const router = Router();

/**
 * STEP 1 — Redirect user to Google login page
 * GET /api/auth/google
 */
router.get("/google", googleLogin);

/**
 * STEP 2 — Google redirects back here after login
 * GET /api/auth/google/callback
 */
router.get("/google/callback", googleCallback);

export default router;
