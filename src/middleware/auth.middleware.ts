// src/middleware/auth.middleware.ts
/**
 * Middleware para proteger rutas mediante JWT.
 *
 * Requiere un header: Authorization: Bearer <token>
 * Si el token es válido, agrega `req.user = { uid, email }`
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'supersecret'; // cambiar por tu clave real

export interface AuthRequest extends Request {
  user?: { uid: string; email: string };
}

export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, SECRET_KEY) as { uid: string; email: string };
    req.user = { uid: payload.uid, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
