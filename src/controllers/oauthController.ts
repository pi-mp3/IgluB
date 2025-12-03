/**
 * oauthController.ts
 *
 * Google OAuth 2.0 Sign-In Controller
 * Final production-ready version.
 * Clean, stable and fully documented in English.
 */

import { Request, Response } from "express";
import admin from "firebase-admin";
import { db } from "../firebase/firebase";
import { OAuth2Client } from "google-auth-library";

const FRONTEND_REDIRECT =
  process.env.FRONTEND_REDIRECT_URL || "http://localhost:5173/auth/success";

// Google OAuth2 Client
// Values MUST match the Google Cloud Console configuration.
export const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_REDIRECT_URI! // Example: http://localhost:5000/api/auth/google/callback
);

/**
 * STEP 1 — Redirect user to Google Consent Page
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
 * STEP 2 — Google redirects back with ?code=...
 */
export const oauthCallback = async (req: Request, res: Response) => {
  try {
    const code = (req.query.code as string) || (req.body?.code as string);
    if (!code)
      return res.status(400).json({ error: "Missing authorization code" });

    // Exchange `code` for Google tokens
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    if (!tokens.id_token)
      return res
        .status(500)
        .json({ error: "Google did not return an ID token" });

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();
    if (!payload)
      return res.status(400).json({ error: "Invalid Google token" });

    const uid = payload.sub;

    // -----------------------------------------------------
    //   Sync with Firebase Authentication
    // -----------------------------------------------------
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

    // -----------------------------------------------------
    //   Sync with Firestore Database
    // -----------------------------------------------------
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    const exists = userSnap.exists;

    const userData = {
      id: uid,
      name: firebaseUser.displayName || "",
      lastName: "",
      email: firebaseUser.email!,
      age: null,
      provider: "google",
      photoURL: firebaseUser.photoURL || "",
      updatedAt: new Date(),
      createdAt: exists ? userSnap.data()?.createdAt : new Date(),
    };

    if (!exists) {
      await userRef.set(userData);
    } else {
      await userRef.update({
        name: userData.name,
        email: userData.email,
        photoURL: userData.photoURL,
        updatedAt: new Date(),
      });
    }

    // -----------------------------------------------------
    //   Redirect to frontend authentication success page
    // -----------------------------------------------------
    return res.redirect(`${FRONTEND_REDIRECT}?uid=${uid}`);
  } catch (error) {
    console.error("Google OAuth Callback Error:", error);
    return res.status(500).json({ error: "OAuth callback failed" });
  }
};
