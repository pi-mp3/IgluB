// src/controllers/logout.controller.ts

import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

export const logoutUser = (req: AuthRequest, res: Response) => {
  try {
    // El token se invalida en frontend borrándolo del localStorage.
    // Aquí solo confirmamos que el usuario está autenticado.
    return res.json({ mensaje: "Sesión cerrada correctamente" });
  } catch (error: any) {
    return res.status(500).json({ error: "Error al cerrar sesión" });
  }
};
