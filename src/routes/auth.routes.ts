/**
 * authManual.routes.ts
 * ---------------------------------------------------------
 * Manual Email/Password Login using REAL Firebase Authentication.
 *
 * This file replaces the previous mock login logic.
 * It performs a REAL sign-in request against Firebase Auth
 * using the REST API (email + password).
 *
 * USER EXPERIENCE (in Postman or Frontend):
 *  - Success → JSON containing JWT + Firebase user data
 *  - Failure → "Invalid credentials" (401)
 *
 * ENDPOINTS:
 *   POST /manual/login
 *
 * Author: Your Name
 * ---------------------------------------------------------
 */

import { Router } from "express";
import jwt from "jsonwebtoken";
import { auth } from "../firebase/firebase"; // Firebase Admin

const router = Router();

/**
 * POST /manual/login
 * ---------------------------------------------------------
 * Validates email/password using Firebase Auth REST API.
 * Steps:
 *  1. Send email/password to Firebase Auth REST API
 *  2. If valid → retrieve user from Firebase Admin
 *  3. Generate backend JWT
 * ---------------------------------------------------------
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Missing fields?
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 1. Firebase Sign In
    const firebaseAuthRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await firebaseAuthRes.json();

    // Firebase rejected credentials
    if (!firebaseAuthRes.ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Retrieve real user info from Firebase Admin
    const firebaseUser = await auth.getUser(data.localId);

    // 3. Generate backend JWT
    const token = jwt.sign(
      {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || "No Name",
      },
    });
  } catch (error) {
    console.error("MANUAL LOGIN ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
