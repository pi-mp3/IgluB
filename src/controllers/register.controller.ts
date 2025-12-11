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
 * Validates password strength: must have uppercase, lowercase, number, special char, min 8 chars
 */
const isPasswordStrong = (password: string): boolean => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
};

/**
 * Manual registration.
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

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser: User = {
      uid: userRecord.uid,
      name: firstName,
      lastName,
      age,
      email,
      password: hashedPassword,
      authProvider: 'manual',
      createdAt: new Date(),
      updatedAt: new Date(),
      photoURL: '',
    };

    await userRef.doc(userRecord.uid).set(newUser);

    return res.status(201).json({
      uid: userRecord.uid,
      message: 'Usuario registrado exitosamente',
      ...newUser, // devuelve todos los datos guardados
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Manual login.
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
      ...userData,
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Google OAuth login.
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
      // Crear usuario nuevo
      const userRecord = await auth.createUser({
        email,
        displayName: name,
      });

      userData = {
        uid: userRecord.uid,
        name,
        lastName: '',
        age: undefined,
        email,
        authProvider: 'google',
        photoURL: picture || '',
        oauthId: googleId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await userRef.doc(userRecord.uid).set(userData);
      userId = userRecord.uid;
    } else {
      // Usuario ya existe → obtenerlo completo
      userId = snapshot.docs[0].id;
      userData = snapshot.docs[0].data() as User;
    }

    const token = jwt.sign({ uid: userId, email }, JWT_SECRET, { expiresIn: '2h' });

    return res.json({
      mensaje: 'Inicio de sesión con Google exitoso',
      token,
      ...userData,
    });
  } catch (err) {
    console.error('GOOGLE LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Logout endpoint.
 */
export const logout = (_req: Request, res: Response) => {
  return res.json({ message: 'Cierre de sesión exitoso, elimina el token en el frontend' });
};
