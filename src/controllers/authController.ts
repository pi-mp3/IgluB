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
 * @param {string} uid - Firebase user ID.
 * @returns {string} JWT token.
 */
const generateToken = (uid: string): string => {
  return jwt.sign({ uid }, JWT_SECRET, { expiresIn: "7d" });
};

/**
 * Registers a new user in Firebase Authentication and Firestore.
 */
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password, ...data } = req.body as User & { password: string };

    const userRecord = await auth.createUser({ email, password });
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
 * Logs in a user.
 * NOTE: Password login must be handled on frontend using Firebase Client SDK.
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;

    const user = await auth.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    return res.status(400).json({
      error: "El inicio de sesión con contraseña debe manejarse en el frontend con Firebase Client SDK",
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
 * NOTE: This must be handled in the frontend using Firebase Client SDK.
 */
export const recoverPassword = async (req: Request, res: Response): Promise<Response> => {
  return res.status(400).json({
    error: "La recuperación de contraseña debe realizarse desde el frontend con Firebase Client SDK",
  });
};
