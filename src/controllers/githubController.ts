/**
 * githubController.ts
 *
 * GitHub OAuth 2.0 Controller - VERSION CORREGIDA
 */

import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import admin from "firebase-admin";
import { db } from "../firebase/firebase";
import jwt from "jsonwebtoken";

/**
 * ENV:
 * GITHUB_CLIENT_ID=
 * GITHUB_CLIENT_SECRET=
 * GITHUB_REDIRECT_URI=http://localhost:5000/api/auth/github/callback
 * FRONTEND_CALLBACK_URL=http://localhost:5173/oauth/callback
 * JWT_SECRET=
 */

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

const FRONTEND_CALLBACK =
  process.env.FRONTEND_CALLBACK_URL || "http://localhost:5173/oauth/callback";

/**
 * GitHub Strategy
 */
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_REDIRECT_URI!,
      scope: ["user:email"],
    },

    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: any) => void
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done("GitHub did not return an email");

        let firebaseUser;

        // Sync Firebase Auth
        try {
          firebaseUser = await admin.auth().getUserByEmail(email);
        } catch {
          firebaseUser = await admin.auth().createUser({
            email,
            displayName: profile.username || "GitHub User",
            photoURL: profile.photos?.[0]?.value || null,
            emailVerified: true,
          });
        }

        const uid = firebaseUser.uid;

        // Sync Firestore
        const userRef = db.collection("users").doc(uid);
        const snap = await userRef.get();
        const exists = snap.exists;

        const userData = {
          id: uid,
          name: firebaseUser.displayName || "",
          lastName: "",
          email: firebaseUser.email!,
          provider: "github",
          photoURL: firebaseUser.photoURL || "",
          age: null,
          updatedAt: new Date(),
          createdAt: exists ? snap.data()?.createdAt : new Date(),
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

        return done(null, firebaseUser);
      } catch (err) {
        return done(err);
      }
    }
  )
);

/**
 * STEP 1 — Login
 */
export const githubAuth = passport.authenticate("github");

/**
 * STEP 2 — Callback
 */
export const githubCallback = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("github", (err: any, user: any): void => {
    if (err || !user) {
      return res.redirect(
        `${FRONTEND_CALLBACK}?error=github-auth-failed`
      );
    }

    const uid = user.uid;

    // Create JWT for frontend
    const token = jwt.sign({ uid }, JWT_SECRET, { expiresIn: "7d" });

    // Redirect to React callback
    return res.redirect(
      `${FRONTEND_CALLBACK}?token=${token}&uid=${uid}&provider=github`
    );
  })(req, res, next);
};
