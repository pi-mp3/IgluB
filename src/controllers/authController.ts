/**
 * auth.controller.ts
 *
 * Controlador unificado para:
 *  - Registro con email/password
 *  - Login con email
 *  - Sincronización con Firestore
 */

import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { auth, db } from "../firebase/firebase";
import { User } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "my_secret_key";

/** Crear token */
const generateToken = (uid: string, email: string): string => {
  return jwt.sign({ uid, email }, JWT_SECRET, { expiresIn: "7d" });
};

/**
 * REGISTRO (email y password)
 */
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password, name, lastName, age } = req.body as User & { password: string };

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${name} ${lastName || ""}`.trim(),
    });

    const uid = userRecord.uid;

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

    await db.collection("users").doc(uid).set(userData);

    return res.json({
      mensaje: "Usuario registrado correctamente",
      uid,
      ...userData
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
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;

    const userRecord = await auth.getUserByEmail(email);

    if (!userRecord) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const uid = userRecord.uid;

    // Leer Firestore
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    let userData;

    if (!userSnap.exists) {
      // Si viene de OAuth por primera vez
      userData = {
        id: uid,
        name: userRecord.displayName || "",
        lastName: "",
        email,
        provider: "",
        age: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await userRef.set(userData);
    } else {
      userData = userSnap.data();
    }

    const token = generateToken(uid, email);

    return res.json({
      mensaje: "Inicio de sesión exitoso",
      uid,
      token,
      ...userData
    });

  } catch (err: any) {
    return res.status(400).json({
      error: "Error al iniciar sesión",
      detalles: err.message,
    });
  }
};

/**
 * UPDATE USER
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
 * RECUPERAR CONTRASEÑA
 */
export const recoverPassword = async (req: Request, res: Response): Promise<Response> => {
  return res.status(400).json({
    error: "La recuperación de contraseña debe realizarse desde el frontend con Firebase Client SDK",
  });
};
