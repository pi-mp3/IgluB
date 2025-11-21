/**
 * register.controller.ts
 * 
 * Controller for user registration and authentication.
 * Supports manual registration/login, Google OAuth, Facebook OAuth, and logout.
 * 
 * @module controllers/register
 */

import { Request, Response } from 'express';
import { db } from '../firebase/firebase';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/register';

// Facebook SDK requires require for TypeScript
const FB = require('fb');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const SALT_ROUNDS = 10;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Validate password strength
 * Must contain at least 8 characters, one uppercase, one lowercase, one number, one special character
 * 
 * @param password - Password string to validate
 * @returns boolean indicating if password is valid
 */
const isPasswordStrong = (password: string): boolean => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
};

/**
 * Manual user registration
 * POST /api/auth/register
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, lastName, age, email, password } = req.body;

    if (!name || !lastName || !age || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (!isPasswordStrong(password)) {
      return res.status(400).json({ 
        message: 'La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, número y un carácter especial' 
      });
    }

    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).get();
    if (!snapshot.empty) {
      return res.status(400).json({ message: 'Usuario ya registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser: User = {
      name,
      lastName,
      age,
      email,
      password: hashedPassword,
      authProvider: 'manual',
      createdAt: new Date()
    };

    const docRef = await userRef.add(newUser);
    return res.status(201).json({ id: docRef.id, message: 'Usuario registrado exitosamente' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Manual login
 * POST /api/auth/login
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
    return res.json({ token, message: 'Inicio de sesión exitoso' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Google OAuth login
 * POST /api/auth/login/google
 */
export const loginGoogle = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Token requerido' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) return res.status(401).json({ message: 'Token inválido' });

    const { email, name, sub: googleId } = payload;

    if (!email || !name || !googleId) {
      return res.status(400).json({ message: 'Información incompleta del token de Google' });
    }

    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).get();

    let userId: string;
    if (snapshot.empty) {
      const newUser: User = {
        name,
        email,
        authProvider: 'google',
        oauthId: googleId,
        createdAt: new Date()
      };
      const docRef = await userRef.add(newUser);
      userId = docRef.id;
    } else {
      userId = snapshot.docs[0].id;
    }

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token, message: 'Inicio de sesión con Google exitoso' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Facebook OAuth login
 * POST /api/auth/login/facebook
 */
export const loginFacebook = async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ message: 'Access token requerido' });

    const fbResponse: any = await FB.api('me', {
      fields: ['id', 'name', 'email'],
      access_token: accessToken
    });

    const { id: facebookId, name, email } = fbResponse;
    if (!facebookId || !email || !name) {
      return res.status(400).json({ message: 'Información incompleta de Facebook' });
    }

    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).get();

    let userId: string;
    if (snapshot.empty) {
      const newUser: User = {
        name,
        email,
        authProvider: 'facebook',
        oauthId: facebookId,
        createdAt: new Date()
      };
      const docRef = await userRef.add(newUser);
      userId = docRef.id;
    } else {
      userId = snapshot.docs[0].id;
    }

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token, message: 'Inicio de sesión con Facebook exitoso' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Logout (frontend removes token)
 * POST /api/auth/logout
 */
export const logout = (_req: Request, res: Response) => {
  return res.json({ message: 'Cierre de sesión exitoso, elimine el token en el frontend' });
};
