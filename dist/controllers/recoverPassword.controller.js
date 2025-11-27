"use strict";
/**
 * recoverPassword.controller.ts
 *
 * Controller responsible ONLY for validating the email
 * and confirming that the Firebase user exists.
 *
 * NOTE:
 * Password recovery email is sent from the FRONTEND
 * using Firebase Auth (sendPasswordResetEmail).
 *
 * Documentation: English
 * User messages: Spanish
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.recoverPassword = void 0;
const auth_1 = require("firebase-admin/auth");
/**
 * POST /api/user/recover-password
 *
 * Expects:
 * {
 *   email: string
 * }
 *
 * Process:
 * 1. Validates email
 * 2. Searches user in Firebase
 * 3. Returns success so frontend can send reset email
 */
const recoverPassword = async (req, res) => {
    const { email } = req.body;
    // ------------------------
    // Validate email
    // ------------------------
    if (!email) {
        return res.status(400).json({
            message: "El correo es obligatorio",
        });
    }
    try {
        const auth = (0, auth_1.getAuth)();
        // ---------------------------------------------------
        // 1. Check if user exists in Firebase
        // ---------------------------------------------------
        const userRecord = await auth.getUserByEmail(email).catch(() => null);
        if (!userRecord) {
            return res.status(404).json({
                message: "No existe un usuario con este correo",
            });
        }
        // ---------------------------------------------------
        // 2. Everything OK — frontend will send the email
        // ---------------------------------------------------
        return res.json({
            message: "✔ Usuario verificado. Procede a enviar el correo desde el frontend.",
        });
    }
    catch (err) {
        console.error("Recover password error:", err);
        return res.status(500).json({
            message: "Error procesando la solicitud",
            error: err.message,
        });
    }
};
exports.recoverPassword = recoverPassword;
