/**
 * google.routes.ts
 *
 * Google OAuth routes.
 * Only handles:
 *  - Redirect to Google
 *  - OAuth callback
 *
 * Logic is handled in googleController.ts
 */

import { Router } from "express";
import {
  googleLogin,
  googleCallback,
} from "../controllers/oauthController";

const router = Router();

/**
 * STEP 1
 * GET /api/auth/google
 * → Send user to Google login screen
 */
router.get("/google", googleLogin);

/**
 * STEP 2
 * GET /api/auth/google/callback
 * → Google redirects back here
 */
router.get("/google/callback", googleCallback);

export default router;
