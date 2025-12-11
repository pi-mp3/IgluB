/**
 * oauthController.ts
 *
 * Handles Google OAuth login + callback flow.
 *
 * Developer documentation: English
 * User-facing messages: Spanish
 *
 * This controller:
 *  - Redirects user to Google OAuth provider (handled by backend route)
 *  - Receives Google's callback with ?code=
 *  - Exchanges the authorization code for user profile data
 *  - Creates or syncs the user in Firestore
 *  - Generates a custom JWT and redirects to frontend with credentials
 */

import { Request, Response } from "express";
import { db, auth } from "../firebase/firebase";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";

const JWT_SECRET = process.env.JWT_SECRET || "my_secret_key";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/** Generates the local JWT */
const generateToken = (uid: string, email: string): string => {
  return jwt.sign({ uid, email }, JWT_SECRET, { expiresIn: "7d" });
};

/**
 * STEP 1 — Redirect user to Google OAuth page
 */
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const url =
      "https://accounts.google.com/o/oauth2/v2/auth?" +
      new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: "code",
        scope: "profile email",
        access_type: "offline",
        prompt: "consent",
      });

    return res.redirect(url);
  } catch (err: any) {
    console.error("Google Login Error:", err);
    return res.status(500).json({
      error: "Error al iniciar autenticación con Google",
      detalles: err.message,
    });
  }
};

/**
 * STEP 2 — Google redirects back with ?code=
 * This controller:
 *  - Exchanges the code for access_token & id_token
 *  - Extracts user profile
 *  - Saves/updates Firestore user
 *  - Generates JWT
 *  - Redirects user to the frontend with token + data
 */
export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${FRONTEND_URL}/auth/success/login?error=missing-code`);
    }

    /** Exchange code for tokens */
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.redirect(
        `${FRONTEND_URL}/auth/success/login?error=google-token-failed`
      );
    }

    /** Get Google Profile */
    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    const profile = await profileRes.json();

    const uid = profile.id;
    const email = profile.email;

    /** Check Firestore user */
    const userRef = db.collection("users").doc(uid);
    const snap = await userRef.get();

    const userData = {
      id: uid,
      name: profile.given_name || "",
      lastName: profile.family_name || "",
      email,
      provider: "google",
      photoURL: profile.picture || "",
      age: null,
      createdAt: snap.exists ? snap.data()!.createdAt : new Date(),
      updatedAt: new Date(),
    };

    /** Save/update Firestore */
    await userRef.set(userData, { merge: true });

    /** Generate authentication token */
    const token = generateToken(uid, email);

    /** Redirect to frontend with token */
    return res.redirect(
      `${FRONTEND_URL}/auth/success?token=${token}&uid=${uid}`
    );

  } catch (err: any) {
    console.error("Google Callback Error:", err);
    return res.status(500).json({
      error: "Error al procesar la autenticación con Google",
      detalles: err.message,
    });
  }
};
