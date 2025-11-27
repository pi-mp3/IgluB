import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { auth, db } from "../firebase/firebase";
import { User } from "../models/register";

const JWT_SECRET = process.env.JWT_SECRET || "my_secret_key";

/**
 * Generates a JWT token for a user.
 * @param {string} uid - Firebase user ID.
 * @returns {string} Generated JWT token.
 */
const generateToken = (uid: string): string => {
  return jwt.sign({ uid }, JWT_SECRET, { expiresIn: "7d" });
};

/**
 * Registers a new user in Firebase Authentication and Firestore.
 */
export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, password, ...data } = req.body as User & {
      password: string;
    };

    const userRecord = await auth.createUser({ email, password });

    await db.collection("users").doc(userRecord.uid).set(data);

    return res.json({ uid: userRecord.uid });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

/**
 * Logs in a user.
 * NOTE: Firebase Admin SDK cannot validate passwords.
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;

    const user = await auth.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.status(400).json({
      error:
        "Password login must be handled on the frontend using Firebase Client SDK.",
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

/**
 * Updates user data in Firestore.
 */
export const updateUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.params.id;
    const newData = req.body;

    await db.collection("users").doc(userId).update(newData);

    return res.json({ message: "User updated successfully" });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

/**
 * Get user profile data
 */

export const getUserById = async (req: Request, res: Response) => {
  console.log("📌 [GET USER] Iniciando endpoint /user/:id");

  try {
    const userId = req.params.id;

    // Validamos que haya enviado un ID
    if (!userId) {
      console.warn("⚠️ No se envió userId en los params");
      return res.status(400).json({ error: "Missing user ID in params" });
    }

    console.log("🔎 Buscando userId:", userId);

    const docRef = db.collection("users").doc(userId);
    const userDoc = await docRef.get();

    if (!userDoc.exists) {
      console.warn(`⚠️ Usuario ${userId} no existe en Firestore`);
      return res.status(404).json({ error: "User not found" });
    }

    const profile = userDoc.data();
    console.log("✅ Usuario encontrado:", profile);

    return res.status(200).json(profile);
  } catch (err: any) {
    console.error("❌ [SERVER ERROR] getUserById:", err);
    return res.status(500).json({
      message: "Server error getting user",
      error: err.message,
    });
  }
};

/**
 * Deletes a user from Firebase Authentication and Firestore.
 */
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.params.id;

    await auth.deleteUser(userId);
    await db.collection("users").doc(userId).delete();

    return res.json({ message: "User deleted successfully" });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

/**
 * Sends a password recovery email (Frontend responsibility).
 */
export const recoverPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    return res.status(400).json({
      error:
        "Password recovery must be done using Firebase Client SDK on the frontend.",
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};