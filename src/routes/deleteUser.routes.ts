/**
 * deleteUser.routes.ts
 *
 * Ruta para eliminar usuarios.
 *
 * @module routes/deleteUser
 */

import { Router } from "express";
import { deleteUser } from "../controllers/deleteUser.controller";

const router = Router();

router.delete("/:id", deleteUser);

export default router;
