/**
 * oauthController.ts
 *
 * Handles Google OAuth authentication flow.
 * Generates Google login URL and processes the callback to return authenticated user data.
 *
 * @module controllers/oauthController
 */

import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

// Verificación de variables de entorno
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.REDIRECT_URI) {
  throw new Error('Faltan variables de entorno de Google OAuth2.');
}

/**
 * Google OAuth2 client instance
 * Exposed to allow route initialization of the login URL
 */
export const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI // Example: http://localhost:5000/api/auth/google/callback
);

/**
 * Generates the Google login URL for OAuth2 authentication.
 *
 * @returns {string} URL to redirect the user to Google login
 */
export const getGoogleLoginUrl = (): string => {
  return googleClient.generateAuthUrl({
    access_type: 'offline', // Necesario para refresh_token
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    prompt: 'consent', // Fuerza a Google a entregar refresh_token
  });
};

/**
 * Callback handler for Google OAuth.
 * Exchanges authorization code for tokens and user information.
 *
 * @param req Express Request
 * @param res Express Response
 */
export const oauthCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: 'Código de autorización no proporcionado.' });
    }

    // Exchange authorization code for access tokens
    const { tokens } = await googleClient.getToken(code as string);
    googleClient.setCredentials(tokens);

    if (!tokens.id_token) {
      return res.status(500).json({ message: 'No se recibió id_token de Google.' });
    }

    // Fetch user info
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({ message: 'No se pudo obtener información del usuario.' });
    }

    const userData = {
      nombre: payload.name,
      email: payload.email,
      foto: payload.picture,
    };

    // 🔹 REDIRECCIÓN AL FRONTEND EN LUGAR DE DEVOLVER JSON
    // Ajusta la URL según tu frontend
    const frontendUrl = 'http://localhost:5173/dashboard';

    // Opcional: podrías pasar info del usuario en query params si quieres
    // const params = new URLSearchParams({ name: userData.nombre, email: userData.email });
    // return res.redirect(`${frontendUrl}?${params.toString()}`);

    return res.redirect(frontendUrl);

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return res.status(500).json({ message: 'Error en el proceso de autenticación.' });
  }
};
