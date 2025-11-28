/**
 * editUser.routes.ts
 *
 * Routes to manage user profile operations.
 *
 * @module routes/editUser
 */
import { Router } from "express";
import { editUser } from "../controllers/editUser.controller";

const router = Router();

router.put("/:id", editUser);

export default router;
