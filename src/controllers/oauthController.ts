/**
 * oauthController.ts — GOOGLE OAUTH
 * VERSION CORREGIDA PARA /oauth/callback
 */

import { Request, Response } from "express";
import admin from "firebase-admin";
import { db } from "../firebase/firebase";
import { OAuth2Client } from "google-auth-library";

const FRONTEND_CALLBACK =
  process.env.FRONTEND_CALLBACK_URL || "http://localhost:5173/oauth/callback";

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
    const code = (req.query.code as string) || (req.body?.code as string);
    if (!code) return res.status(400).json({ error: "Missing authorization code" });

    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    if (!tokens.id_token)
      return res.status(500).json({ error: "Google returned no ID token" });

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ error: "Invalid Google token" });

    const uid = payload.sub;

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

    // Redirect to the correct React callback
    return res.redirect(
      `${FRONTEND_CALLBACK}?uid=${uid}&provider=google`
    );
  } catch (err) {
    console.error("Google OAuth Callback Error:", err);
    return res.status(500).json({ error: "OAuth callback failed" });
  }
};
