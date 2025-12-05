import { Request, Response } from 'express';
import { db, auth } from '../firebase/firebase';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/register';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const SALT_ROUNDS = 10;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Checks password strength.
 * @param password Plain-text password.
 * @returns boolean indicating if password is strong.
 */
const isPasswordStrong = (password: string): boolean => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
};

/**
 * Manual user registration.
 * Creates user in Firebase Auth and Firestore.
 * POST /api/auth/register
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

    // Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    // Hash password for Firestore
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Unified Firestore schema (same as OAuth)
    const newUser = {
      id: userRecord.uid,
      name: firstName,
      lastName: lastName || '',
      email,
      password: hashedPassword,
      provider: 'email',
      photoURL: '',
      age: age || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await userRef.doc(userRecord.uid).set(newUser); // Use UID as document ID

    return res.status(201).json({
      id: userRecord.uid,
      message: 'Usuario registrado exitosamente',
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Manual login.
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
    if (snapshot.empty) return res.status(400).json({ message: 'Usuario no encontrado' });

    const userData = snapshot.docs[0].data();
    const userId = snapshot.docs[0].id;

    const match = await bcrypt.compare(password, userData.password || '');
    if (!match) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign({ uid: userId, email }, JWT_SECRET, { expiresIn: '2h' });

    return res.json({ 
      token, 
      user: {
        uid: userId,
        email: userData.email,
        name: userData.name,
        lastName: userData.lastName,
        photoURL: userData.photoURL || ''
      },
      message: 'Inicio de sesión exitoso' 
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Google OAuth login.
 * POST /api/auth/login/google
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

    const { email, name, sub: googleId } = payload;
    if (!email || !name || !googleId) return res.status(400).json({ message: 'Información incompleta del token de Google' });

    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).get();

    let userId: string;
    if (snapshot.empty) {
      const userRecord = await auth.createUser({ email, displayName: name });

      const newUser: User = {
        name,
        lastName: '',
        age: 0,
        email,
        password: '',
        authProvider: 'google',
        oauthId: googleId,
        createdAt: new Date(),
        uid: userRecord.uid,
      };

      await userRef.doc(userRecord.uid).set(newUser);
      userId = userRecord.uid;
    } else {
      userId = snapshot.docs[0].id;
    }

    const token = jwt.sign({ uid: userId, email }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token, message: 'Inicio de sesión con Google exitoso' });
  } catch (err) {
    console.error('GOOGLE LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Logout handler.
 */
export const logout = (_req: Request, res: Response) => {
  return res.json({ message: 'Cierre de sesión exitoso, elimina el token en el frontend' });
};
