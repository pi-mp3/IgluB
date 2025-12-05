/**
 * githubRoutes.ts
 *
 * GitHub OAuth Routes
 * Manages the GitHub OAuth 2.0 login flow:
 *  - GET /auth/github          → Redirects user to GitHub Login
 *  - GET /auth/github/callback → GitHub returns the authorization code
 */

import { Router } from "express";
import passport from "passport";
import { githubAuth, githubCallback } from "../controllers/githubController";

const router = Router();

/**
 * GET /auth/github
 * Initiates GitHub OAuth login by redirecting user to GitHub.
 */
router.get("/github", githubAuth);

/**
 * GET /auth/github/callback
 * GitHub redirects back with ?code=...
 * Passport processes the callback and passes control to githubCallback.
 */
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  githubCallback
);

export default router;
