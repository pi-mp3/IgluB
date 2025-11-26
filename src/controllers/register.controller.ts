// src/controllers/register.controller.ts

import { Request, Response } from 'express';
import { db, auth } from '../firebase/firebase';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/register';

const FB = require('fb');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const SALT_ROUNDS = 10;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Validates that a password meets strength requirements.
 * @param password - The plain-text password to validate.
 * @returns True if the password is considered strong.
 */
const isPasswordStrong = (password: string): boolean => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
};

/**
 * Handles manual user registration.
 * Creates a user in Firebase Auth and also stores profile data in Firestore.
 *
 * POST /api/auth/register
 *
 * @param req - Express request, expects firstName, lastName, age, email, and password in body.
 * @param res - Express response.
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, age, email, password } = req.body;

    if (!firstName || !lastName || !age || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (!isPasswordStrong(password)) {
      return res.status(400).json({
        message:
          'La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, número y un carácter especial',
      });
    }

    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).get();
    if (!snapshot.empty) {
      return res.status(400).json({ message: 'Usuario ya registrado' });
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    // Hash the password to store in Firestore
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser: User = {
      name: firstName,
      lastName,
      age,
      email,
      password: hashedPassword,
      authProvider: 'manual',
      createdAt: new Date(),
      uid: userRecord.uid, // assign the Auth UID
    };

    const docRef = await userRef.add(newUser);

    return res.status(201).json({
      id: docRef.id,
      authUid: userRecord.uid,
      message: 'Usuario registrado exitosamente',
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Handles manual login.
 *
 * POST /api/auth/login
 *
 * @param req - Express request, expects email and password in body.
 * @param res - Express response.
 */
export const loginManual = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
    }

    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).get();
    if (snapshot.empty) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const userData = snapshot.docs[0].data() as User;
    const userId = snapshot.docs[0].id;

    const match = await bcrypt.compare(password, userData.password || '');
    if (!match) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '2h' });

    return res.json({
      token,
      message: 'Inicio de sesión exitoso',
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Handles Google OAuth login.
 * Verifies the Google ID token, then creates or retrieves the user in Firestore.
 * If the user doesn't exist, also creates them in Firebase Auth.
 *
 * POST /api/auth/login/google
 *
 * @param req - Express request, expects idToken in body.
 * @param res - Express response.
 */
export const loginGoogle = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Token requerido' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    const { email, name, sub: googleId } = payload;
    if (!email || !name || !googleId) {
      return res.status(400).json({ message: 'Información incompleta del token de Google' });
    }

    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).get();

    let userId: string;
    if (snapshot.empty) {
      const userRecord = await auth.createUser({
        email,
        displayName: name,
      });

      const newUser: User = {
        name,
        lastName: '',
        age: 0,
        email,
        password: '',  
        authProvider: 'google',
        oauthId: googleId,
        createdAt: new Date(),
        uid: userRecord.uid, // assign UID
      };

      const docRef = await userRef.add(newUser);
      userId = docRef.id;
    } else {
      userId = snapshot.docs[0].id;
    }

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '2h' });

    return res.json({
      token,
      message: 'Inicio de sesión con Google exitoso',
    });
  } catch (err) {
    console.error('GOOGLE LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Handles Facebook OAuth login.
 * Verifies the Facebook access token, then creates or retrieves the user in Firestore.
 * If the user doesn't exist, also creates them in Firebase Auth.
 *
 * POST /api/auth/login/facebook
 *
 * @param req - Express request, expects accessToken in body.
 * @param res - Express response.
 */
export const loginFacebook = async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ message: 'Access token requerido' });
    }

    const fbResponse: any = await FB.api('me', {
      fields: ['id', 'name', 'email'],
      access_token: accessToken,
    });

    const { id: facebookId, name, email } = fbResponse;
    if (!facebookId || !name || !email) {
      return res.status(400).json({ message: 'Información incompleta de Facebook' });
    }

    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).get();
    let userId: string;

    if (snapshot.empty) {
      const userRecord = await auth.createUser({
        email,
        displayName: name,
      });

      const newUser: User = {
        name,
        lastName: '',
        age: 0,
        email,
        password: '',
        authProvider: 'facebook',
        oauthId: facebookId,
        createdAt: new Date(),
        uid: userRecord.uid, // assign UID
      };

      const docRef = await userRef.add(newUser);
      userId = docRef.id;
    } else {
      userId = snapshot.docs[0].id;
    }

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token, message: 'Inicio de sesión con Facebook exitoso' });
  } catch (err) {
    console.error('FACEBOOK LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Logout handler.
 * This endpoint does not invalidate tokens server-side; the frontend should discard the token.
 * 
 * POST /api/auth/logout
 * 
 * @param _req - Express request (no body needed).
 * @param res - Express response.
 */
export const logout = (_req: Request, res: Response) => {
  return res.json({ message: 'Cierre de sesión exitoso, elimina el token en el frontend' });
};
