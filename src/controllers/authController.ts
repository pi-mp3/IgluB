/**
 * auth.controller.ts
 *
 * Handles user registration, login, update, and password recovery.
 * Technical documentation in English; user-facing messages in Spanish.
 */


import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { auth, db } from "../firebase/firebase";
import { User } from "../models/register";

const JWT_SECRET = process.env.JWT_SECRET || "my_secret_key";

/**
 * Generates a JWT token for a user.
 * Includes both uid AND email.
 */
const generateToken = (uid: string, email: string): string => {
  return jwt.sign({ uid, email }, JWT_SECRET, { expiresIn: "7d" });
};

/**
 * Registers a new user in Firebase Authentication and Firestore.
 */
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password, ...data } = req.body as User & { password: string };

    // Create user in Firebase Authentication
    const userRecord = await auth.createUser({ email, password });

    // Save additional data in Firestore
    await db.collection("users").doc(userRecord.uid).set(data);

    return res.json({
      mensaje: "Usuario registrado correctamente",
      uid: userRecord.uid
    });
  } catch (err: any) {
    return res.status(400).json({
      error: "Error al registrar usuario",
      detalles: err.message
    });
  }
};

/**
 * Logs in a user and generates a JWT token.
 * Note: Password auth must be done in frontend via Firebase Client.
 * Backend only verifies email exists and issues token.
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;

    // Verify if user exists in Firebase Authentication
    const user = await auth.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Generate token with uid + email
    const token = generateToken(user.uid, email);

    return res.json({
      mensaje: "Inicio de sesión exitoso",
      uid: user.uid,
      email,
      token
    });

  } catch (err: any) {
    return res.status(400).json({
      error: "Error al iniciar sesión",
      detalles: err.message
    });
  }
};

/**
 * Updates user data in Firestore.
 */
export const updateUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.params.id;
    const newData = req.body;

    await db.collection("users").doc(userId).update(newData);

    return res.json({ mensaje: "Usuario actualizado correctamente" });
  } catch (err: any) {
    return res.status(400).json({
      error: "Error al actualizar usuario",
      detalles: err.message
    });
  }
};

/**
 * Sends a password recovery email.
 * Must be handled with Firebase Client SDK.
 */
export const recoverPassword = async (req: Request, res: Response): Promise<Response> => {
  return res.status(400).json({
    error: "La recuperación de contraseña debe realizarse desde el frontend con Firebase Client SDK",
  });
};
