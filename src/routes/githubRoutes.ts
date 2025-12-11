/**
 * github.routes.ts
 *
 * GitHub OAuth routes.
 * Only handles:
 *  - Redirect to GitHub
 *  - OAuth callback
 *
 * Logic is in githubController.ts
 */

import { Router } from "express";
import {
  githubAuth,
  githubCallback,
} from "../controllers/githubController";

const router = Router();

/**
 * STEP 1
 * GET /api/auth/github
 * → Redirect to GitHub OAuth login
 */
router.get("/github", githubAuth);

/**
 * STEP 2
 * GET /api/auth/github/callback
 * → GitHub redirects back here
 */
router.get("/github/callback", githubCallback);

export default router;
