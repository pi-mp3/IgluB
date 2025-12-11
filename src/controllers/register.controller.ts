/**
 * register.controller.ts
 *
 * User registration and login controller for Iglu backend.
 * ---------------------------------------------------------
 * - Manual registration & login
 * - Google OAuth login
 * - Logout
 *
 * Developer docs: English
 * User-facing text: Spanish
 */

import { Request, Response } from 'express';
import { db, auth } from '../firebase/firebase';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const SALT_ROUNDS = 10;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Validates password strength.
 */
const isPasswordStrong = (password: string): boolean => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
};

/**
 * Manual registration.
 * POST /auth/register
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, age, email, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || age === undefined || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Validate password strength
    if (!isPasswordStrong(password)) {
      return res.status(400).json({
        message:
          'La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, número y un carácter especial',
      });
    }

    const userRef = db.collection('users');

    // Check if user already exists
    const snapshot = await userRef.where('email', '==', email).get();
    if (!snapshot.empty) {
      return res.status(400).json({ message: 'Usuario ya registrado' });
    }

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    // Hash password for Firestore storage
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Prepare user object to store in Firestore
    const newUser: User = {
      uid: userRecord.uid,
      name: firstName,
      lastName: lastName ?? '',
      email,
      password: hashedPassword,
      provider: "email",
      age: Number(age) ?? undefined,
      photoURL: "",
      oauthId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to Firestore
    await userRef.doc(userRecord.uid).set(newUser);

    // Return full user info with Firebase uid
    return res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      user: newUser
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Manual login.
 * POST /auth/login
 */
export const loginManual = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
    }

    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).get();
    if (snapshot.empty) return res.status(400).json({ message: 'Usuario no encontrado' });

    const userData = snapshot.docs[0].data() as User;
    const userId = snapshot.docs[0].id;

    const match = await bcrypt.compare(password, userData.password || '');
    if (!match) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign({ uid: userId, email }, JWT_SECRET, { expiresIn: '2h' });

    return res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      user: userData
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Google OAuth login.
 * POST /auth/google
 */
export const loginGoogle = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'Token requerido' });

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) return res.status(401).json({ message: 'Token inválido' });

    const { email, name, sub: googleId, picture } = payload;

    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).get();

    let userData: User;
    let userId: string;

    if (snapshot.empty) {
      // Create new user in Firebase Auth
      const userRecord = await auth.createUser({
        email,
        displayName: name,
      });

      userData = {
        uid: userRecord.uid,
        name: name ?? '',
        lastName: '',
        age: undefined,
        email,
        password: '',
        provider: "google",
        photoURL: picture ?? '',
        oauthId: googleId ?? '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await userRef.doc(userRecord.uid).set(userData);
      userId = userRecord.uid;
    } else {
      // Existing user
      userData = snapshot.docs[0].data() as User;
      userId = snapshot.docs[0].id;
    }

    const token = jwt.sign({ uid: userId, email }, JWT_SECRET, { expiresIn: '2h' });

    return res.json({
      mensaje: "Inicio de sesión con Google exitoso",
      token,
      user: userData
    });
  } catch (err) {
    console.error('GOOGLE LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Logout endpoint.
 * POST /auth/logout
 */
export const logout = (_req: Request, res: Response) => {
  return res.json({ message: 'Cierre de sesión exitoso, elimina el token en el frontend' });
};
