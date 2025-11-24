// src/controllers/oauthController.ts

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { auth, db } from '../firebase/firebase';
import { User } from '../models/register';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

/**
 * Google OAuth2 callback endpoint.
 * Exchanges the authorization code for tokens, verifies the ID token,
 * then creates or fetches the user in Firebase Auth and Firestore,
 * and returns a JWT for your backend.
 *
 * POST /api/auth/google/callback
 *
 * @param req - Express request, expects query parameter `code`
 * @param res - Express response
 * @returns JSON with JWT token or error
 */
export const oauthCallback = async (req: Request, res: Response): Promise<Response> => {
  try {
    const code = req.query.code as string;

    if (!code) {
      return res.status(400).json({ message: 'Code faltante en la query' });
    }

    // 1. Intercambia el código por tokens de Google
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    // 2. Verifica el id_token de Google
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ message: 'Token de Google inválido' });
    }

    const { email, name, sub: googleId } = payload;
    if (!email || !name || !googleId) {
      return res.status(400).json({ message: 'Información incompleta del token de Google' });
    }

    // 3. Verifica si el usuario ya existe en Firestore
    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).get();

    let userId: string;
    if (snapshot.empty) {
      // Si no existe, creamos usuario en Auth y Firestore
      const userRecord = await auth.createUser({
        email,
        displayName: name,
      });

      const newUser: User = {
        name,
        lastName: '',     // lo dejamos vacío si no se usa
        age: 0,           // valor por defecto si no se pide
        email,
        password: '',     // no aplicable para OAuth
        authProvider: 'google',
        oauthId: googleId,
        createdAt: new Date(),
        uid: userRecord.uid,  // IMPORTANTE: asignar el uid de Auth
      };

      const docRef = await userRef.doc(userRecord.uid).set(newUser);
      // Podemos usar el uid como ID del documento para mantener consistencia
      userId = userRecord.uid;
    } else {
      // Si existe, tomamos el id del documento (ideally debe ser igual al uid)
      const doc = snapshot.docs[0];
      userId = doc.id;
    }

    // 4. Generar el JWT para tu backend
    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '2h' });

    return res.json({
      token,
      message: 'Inicio de sesión con Google exitoso',
    });
  } catch (err) {
    console.error('GOOGLE OAUTH ERROR:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
