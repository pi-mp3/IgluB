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
 * GET /api/auth/github
 * Inicia login con GitHub
 */
router.get("/github", githubAuth);

/**
 * GET /api/auth/github/callback
 * GitHub devuelve el token
 */
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  githubCallback
);

export default router;
