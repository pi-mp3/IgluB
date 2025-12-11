/**
 * register.routes.ts
 *
 * Manual authentication:
 *  - Email/password login
 *  - Email/password register
 *
 * Controller logic is ALREADY working,
 * so this file only defines the routes.
 */

import { Router } from "express";
import {
  login,
  register
} from "../controllers/authController";

const router = Router();

/**
 * POST /api/auth/login
 * Manual login (email + password)
 */
router.post("/login", login);

/**
 * POST /api/auth/register
 * Manual register
 */
router.post("/register", register);

export default router;
