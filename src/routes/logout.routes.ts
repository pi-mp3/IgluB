// src/routes/logout.routes.ts

import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware";
import { logoutUser } from "../controllers/logout.controller";

const router = Router();

// Cast explícito para que Express acepte nuestro AuthRequest
router.post(
  "/logout",
  authenticateJWT as any,
  logoutUser as any
);

export default router;
