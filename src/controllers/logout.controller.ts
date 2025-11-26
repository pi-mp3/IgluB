// src/controllers/logout.controller.ts
/**
 * Logout controller.
 *
 * Invalida el JWT del usuario (dependiendo de implementación: blacklist o solo cliente).
 * Este ejemplo asume que el frontend elimina el token después de respuesta exitosa.
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';

export const logoutUser = async (req: AuthRequest, res: Response) => {
  try {
    // Aquí podrías agregar lógica para blacklist de tokens si tu backend lo requiere
    return res.status(200).json({ message: '✔ Sesión cerrada correctamente' });
  } catch (err: any) {
    console.error('logoutUser error:', err);
    return res.status(500).json({ message: 'Error cerrando sesión', error: err.message });
  }
};
