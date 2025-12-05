/**
 * auth.controller.ts
 *
 * Unified user controller for:
 * - Email/password registration
 * - Email login
 * - Firestore user sync
 */

import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { auth, db } from "../firebase/firebase";
import { User } from "../models/register";

const JWT_SECRET = process.env.JWT_SECRET || "my_secret_key";

/**
 * Generates a JWT token including uid + email.
 */
const generateToken = (uid: string, email: string): string => {
  return jwt.sign({ uid, email }, JWT_SECRET, { expiresIn: "7d" });
};

/**
 * REGISTRO DE USUARIO (email + password)
 * Sincronizado con Firestore igual que OAuth (Google/GitHub)
 */
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password, name, lastName, age } = req.body as User & { password: string };

    // Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${name} ${lastName || ""}`.trim(),
    });

    const uid = userRecord.uid;

    // Standard user schema in Firestore (same used by Google/GitHub)
    const userData = {
      id: uid,
      name,
      lastName: lastName || "",
      email,
      provider: "email",
      photoURL: "",
      age: age || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save user in Firestore
    await db.collection("users").doc(uid).set(userData);

    return res.json({
      mensaje: "Usuario registrado correctamente",
      uid,
    });
  } catch (err: any) {
    return res.status(400).json({
      error: "Error al registrar usuario",
      detalles: err.message,
    });
  }
};

/**
 * LOGIN (email)
 * No valida contraseña; el frontend debe autenticar
 * Solo genera JWT y valida existencia de usuario en Firestore
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;

    const userRecord = await auth.getUserByEmail(email);

    if (!userRecord) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const uid = userRecord.uid;

    /** Ensure Firestore user exists */
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      // Create minimal user if coming from OAuth first time
      await userRef.set({
        id: uid,
        name: userRecord.displayName || "",
        lastName: "",
        email,
        provider: "email",
        photoURL: userRecord.photoURL || "",
        age: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Generate JWT token
    const token = generateToken(uid, email);

    return res.json({
      mensaje: "Inicio de sesión exitoso",
      uid,
      email,
      token,
    });

  } catch (err: any) {
    return res.status(400).json({
      error: "Error al iniciar sesión",
      detalles: err.message,
    });
  }
};

/**
 * Update user data in Firestore
 */
export const updateUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.params.id;
    const newData = {
      ...req.body,
      updatedAt: new Date(),
    };

    await db.collection("users").doc(userId).update(newData);

    return res.json({ mensaje: "Usuario actualizado correctamente" });
  } catch (err: any) {
    return res.status(400).json({
      error: "Error al actualizar usuario",
      detalles: err.message,
    });
  }
};

/**
 * Password recovery must be done via Firebase Client SDK
 */
export const recoverPassword = async (req: Request, res: Response): Promise<Response> => {
  return res.status(400).json({
    error: "La recuperación de contraseña debe realizarse desde el frontend con Firebase Client SDK",
  });
};
