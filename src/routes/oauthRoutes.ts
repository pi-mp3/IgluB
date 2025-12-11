/**
 * oauthGoogle.ts
 * ---------------------------------------------------------
 * Google OAuth REAL implementation.
 * Exchanges OAuth code → Google tokens → user profile.
 * Then creates (or retrieves) the user inside Firebase Auth.
 * After that we generate our own backend JWT.
 *
 * Author: Your Name
 * ---------------------------------------------------------
 */

import { Router } from "express";
import jwt from "jsonwebtoken";
import { auth } from "../firebase/firebase";
import fetch from "node-fetch";

const router = Router();

/**
 * STEP 1: Redirect to Google OAuth
 */
router.get("/google", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const redirectUri = "http://localhost:5000/api/oauth/google/callback";
  const scope = "openid email profile";

  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code&scope=${scope}`;

  res.redirect(url);
});

/**
 * STEP 2: Google redirects back with "code"
 * Now we exchange:
 *   code → Google Access Token
 *   Google Token → user info
 *   user info → Firebase user
 *   Firebase UID → backend JWT
 */
router.get("/google/callback", async (req, res) => {
  try {
    const code = req.query.code as string;
    if (!code) return res.status(400).send("Missing code");

    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = "http://localhost:5000/api/oauth/google/callback";

    // 1. Exchange code for Google tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:
        `code=${code}` +
        `&client_id=${clientId}` +
        `&client_secret=${clientSecret}` +
        `&redirect_uri=${redirectUri}` +
        "&grant_type=authorization_code",
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token)
      return res.status(401).send("Google OAuth failed");

    // 2. Get Google user profile
    const googleUserRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    const googleUser = await googleUserRes.json();

    // 3. Create or get Firebase user
    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(googleUser.email);
    } catch {
      firebaseUser = await auth.createUser({
        email: googleUser.email,
        displayName: googleUser.name,
        photoURL: googleUser.picture,
      });
    }

    // 4. Generate backend JWT
    const backendToken = jwt.sign(
      {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        provider: "google",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Redirect to frontend
    res.redirect(
      `http://localhost:5173/oauth/callback?` +
        `token=${backendToken}` +
        `&uid=${firebaseUser.uid}` +
        `&email=${firebaseUser.email}` +
        `&name=${firebaseUser.displayName}` +
        `&provider=google`
    );
  } catch (error) {
    console.error("Google OAuth ERROR:", error);
    res.status(500).send("Internal server error");
  }
});

export default router;
