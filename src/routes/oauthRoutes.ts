/**
 * oauthRoutes.ts
 *
 * Handles Google OAuth 2.0 login flow.
 * Supports redirect to Google and callback processing.
 */

import { Router } from "express";
import { oauthCallback, googleClient } from "../controllers/oauthController";

const router = Router();

/**
 * Step 1 — Redirect user to Google OAuth consent screen.
 * GET /api/auth/google
 */
router.get("/google", (req, res) => {
  const url = googleClient.generateAuthUrl({
    scope: ["profile", "email"],
    access_type: "offline",
    prompt: "consent",
  });

  return res.redirect(url);
});

/**
 * Step 2 — Google calls this URL after authentication (GET).
 * Also supports POST because frontend sync uses POST.
 * GET or POST /api/auth/google/callback
 */
router.get("/google/callback", oauthCallback);
router.post("/google/callback", oauthCallback);

export default router;

