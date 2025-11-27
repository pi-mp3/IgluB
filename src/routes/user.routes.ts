import { Router } from "express";
import { getUserById } from "../controllers/auth"; // Ajusta la ruta

const router = Router();

router.get("/:id", getUserById);

export default router;
