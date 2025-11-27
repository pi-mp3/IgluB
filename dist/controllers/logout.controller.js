"use strict";
// src/controllers/logout.controller.ts
/**
 * Logout controller.
 *
 * Invalida el JWT del usuario (dependiendo de implementación: blacklist o solo cliente).
 * Este ejemplo asume que el frontend elimina el token después de respuesta exitosa.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = void 0;
const logoutUser = async (req, res) => {
    try {
        // Aquí podrías agregar lógica para blacklist de tokens si tu backend lo requiere
        return res.status(200).json({ message: '✔ Sesión cerrada correctamente' });
    }
    catch (err) {
        console.error('logoutUser error:', err);
        return res.status(500).json({ message: 'Error cerrando sesión', error: err.message });
    }
};
exports.logoutUser = logoutUser;
