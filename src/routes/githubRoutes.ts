/**
 * githubRoutes.ts
 *
 * Defines GitHub OAuth routes:
 *  - /auth/github          → inicia login con GitHub
 *  - /auth/github/callback → GitHub devuelve el token
 */

import { Router } from "express";
import passport from "passport";
import { githubAuth, githubCallback } from "../controllers/githubController";

const router = Router();

/**
 * Step 1: Redirect user to GitHub OAuth
 * GET /auth/github
 */
router.get("/github", githubAuth);

/**
 * Step 2: GitHub redirects back with code
 * GET /auth/github/callback
 */
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  githubCallback
);

export default router;
