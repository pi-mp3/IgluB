"use strict";
// src/middleware/auth.middleware.ts
/**
 * Middleware para proteger rutas mediante JWT.
 *
 * Requiere un header: Authorization: Bearer <token>
 * Si el token es válido, agrega `req.user = { uid, email }`
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = process.env.JWT_SECRET || 'supersecret'; // cambiar por tu clave real
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        req.user = { uid: payload.uid, email: payload.email };
        next();
    }
    catch (err) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};
exports.authenticateJWT = authenticateJWT;
