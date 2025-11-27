"use strict";
/**
 * resetPassword.controller.ts
 *
 * Controller for handling password reset requests.
 * The frontend must verify the recovery token with Firebase client SDK
 * and obtain the user's email. Then it calls this endpoint with:
 *   { email: string, newPassword: string }
 *
 * Backend responsibilities:
 * - validate input
 * - find the user in Firebase Admin by email
 * - update the user's password using Firebase Admin SDK
 *
 * Documentation: English
 * User-facing messages: Spanish
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = void 0;
const auth_1 = require("firebase-admin/auth");
/**
 * POST /api/user/reset-password
 *
 * Body:
 * {
 *   email: string,       // email obtained after frontend validates token
 *   newPassword: string  // new password chosen by the user
 * }
 *
 * Responses:
 * - 200 { message: '✔ Contraseña actualizada correctamente' }
 * - 400 { message: '...' } on validation errors
 * - 404 { message: 'No existe un usuario con este correo' } if email not found
 * - 500 { message: 'Error al restablecer la contraseña', error: '...' } on server errors
 */
const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    // Validate presence
    if (!email || !newPassword) {
        return res.status(400).json({ message: "Correo electrónico y nueva contraseña son obligatorios" });
    }
    // Validate password length
    if (typeof newPassword !== "string" || newPassword.length < 6) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }
    try {
        const auth = (0, auth_1.getAuth)();
        // Find user by email
        let userRecord;
        try {
            userRecord = await auth.getUserByEmail(email);
        }
        catch (err) {
            // getUserByEmail throws if not found
            return res.status(404).json({ message: "No existe un usuario con este correo" });
        }
        // Update password using Firebase Admin
        await auth.updateUser(userRecord.uid, { password: newPassword });
        return res.status(200).json({ message: "✔ Contraseña actualizada correctamente" });
    }
    catch (error) {
        console.error("resetPassword error:", error);
        // If Firebase returns a specific error message, include it cautiously
        return res.status(500).json({
            message: "Error al restablecer la contraseña",
            error: error?.message ?? String(error),
        });
    }
};
exports.resetPassword = resetPassword;
