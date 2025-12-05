/**
 * oauthController.ts — GOOGLE OAUTH
 * VERSION CORREGIDA PARA /oauth/callback
 */

import { Request, Response } from "express";
import admin from "firebase-admin";
import { db } from "../firebase/firebase";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const FRONTEND_CALLBACK =
  process.env.FRONTEND_CALLBACK_URL || "http://localhost:5173/oauth/callback";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_REDIRECT_URI!
);

/**
 * STEP 1 — Redirect to Google
 */
export const googleLogin = (_req: Request, res: Response) => {
  const authUrl = googleClient.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["profile", "email"],
  });

  return res.redirect(authUrl);
};

/**
 * STEP 2 — Google Callback
 */
export const oauthCallback = async (req: Request, res: Response) => {
  try {
    console.log("=== Google OAuth Callback Started ===");
    console.log("Query params:", req.query);
    console.log("Body:", req.body);
    
    const code = (req.query.code as string) || (req.body?.code as string);
    if (!code) {
      console.error("No authorization code received");
      return res.status(400).json({ error: "Missing authorization code" });
    }

    console.log("Getting tokens from Google...");
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);
    console.log("Tokens received successfully");

    if (!tokens.id_token)
      return res.status(500).json({ error: "Google returned no ID token" });

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      console.error("Invalid payload from Google");
      return res.status(400).json({ error: "Invalid Google token" });
    }

    const uid = payload.sub;
    console.log("User authenticated:", { uid, email: payload.email, name: payload.name });

    // Sync Firebase
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUser(uid);
    } catch {
      firebaseUser = await admin.auth().createUser({
        uid,
        email: payload.email!,
        displayName: payload.name!,
        photoURL: payload.picture!,
        emailVerified: true,
      });
    }

    // Firestore sync
    const ref = db.collection("users").doc(uid);
    const snap = await ref.get();
    const exists = snap.exists;

    const data = {
      id: uid,
      name: firebaseUser.displayName || "",
      lastName: "",
      email: firebaseUser.email!,
      age: null,
      provider: "google",
      photoURL: firebaseUser.photoURL || "",
      updatedAt: new Date(),
      createdAt: exists ? snap.data()?.createdAt : new Date(),
    };

    if (!exists) await ref.set(data);
    else
      await ref.update({
        name: data.name,
        email: data.email,
        photoURL: data.photoURL,
        updatedAt: new Date(),
      });

    // Generate JWT token
    const token = jwt.sign({ uid, email: data.email }, JWT_SECRET, { expiresIn: "7d" });
    console.log("JWT token generated successfully");

    const redirectUrl = `${FRONTEND_CALLBACK}?token=${token}&uid=${uid}&provider=google`;
    console.log("Redirecting to:", redirectUrl);
    
    // Redirect to the correct React callback with token
    return res.redirect(redirectUrl);
  } catch (err: any) {
    console.error("=== Google OAuth Callback Error ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("Full error:", err);
    return res.status(500).json({ error: "OAuth callback failed", details: err.message });
  }
};
