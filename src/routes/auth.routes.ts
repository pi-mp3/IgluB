/**
 * auth.routes.ts
 *
 * Central router that merges:
 *  - Manual login/register
 *  - Google OAuth
 *  - GitHub OAuth
 */

import { Router } from "express";
import registerRoutes from "./register.routes";
import googleRoutes from "./oauthRoutes";
import githubRoutes from "./githubRoutes";

const router = Router();

// Manual login & register
router.use("/auth", registerRoutes);

// Google OAuth routes
router.use("/auth", googleRoutes);

// GitHub OAuth routes
router.use("/auth", githubRoutes);

export default router;
