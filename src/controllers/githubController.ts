/**
 * githubController.ts
 *
 * GitHub OAuth 2.0 Controller — FULLY FIXED & TYPE-SAFE
 * -----------------------------------------------------
 * Fixes included:
 *  - Added TypeScript types for 'done', 'err', and 'user'
 *  - Fully functional GitHub OAuth strategy
 *  - Correct Firebase Auth + Firestore synchronization
 *  - Returns token, uid, provider, email, name, and photoURL to frontend
 *  - Avoids blank screens by ensuring all fields are included
 *
 * Developer documentation: English
 * User messages: Spanish
 */

import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import admin from "firebase-admin";
import { db } from "../firebase/firebase";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

const FRONTEND_CALLBACK =
  process.env.FRONTEND_CALLBACK_URL || "http://localhost:5173/oauth/callback";

/* ============================================================
 *  GitHub Strategy
 * ============================================================ */
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_REDIRECT_URI!,
      scope: ["user:email"],
    },

    // FIX: add explicit 'done' type
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (err: any, user?: any) => void
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done("GitHub did not return an email");

        let firebaseUser;

        // Ensure Firebase Auth user exists
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

        // Firestore user sync
        const userRef = db.collection("users").doc(uid);
        const snap = await userRef.get();
        const exists = snap.exists;

        const userData = {
          id: uid,
          name: firebaseUser.displayName || profile.username || "",
          lastName: "",
          email: firebaseUser.email!,
          provider: "github",
          photoURL: firebaseUser.photoURL || profile.photos?.[0]?.value || "",
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

        return done(null, { ...firebaseUser, extra: userData });
      } catch (err) {
        return done(err);
      }
    }
  )
);

/* ============================================================
 * STEP 1 — Redirect to GitHub
 * ============================================================ */
export const githubAuth = passport.authenticate("github");

/* ============================================================
 * STEP 2 — Callback from GitHub
 * ============================================================ */
export const githubCallback = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "github",

    // FIX: add explicit types here too
    (err: any, user: any): void => {
      if (err || !user) {
        return res.redirect(`${FRONTEND_CALLBACK}?error=github-auth-failed`);
      }

      const uid = user.uid;
      const email = user.email;
      const name = user.displayName || user.extra?.name || "";
      const photoURL = user.photoURL || user.extra?.photoURL || "";

      // Generate JWT
      const token = jwt.sign({ uid, email }, JWT_SECRET, {
        expiresIn: "7d",
      });

      // Final redirect with all required fields
      const redirectURL = `${FRONTEND_CALLBACK}?token=${token}&uid=${uid}&provider=github&email=${encodeURIComponent(
        email
      )}&name=${encodeURIComponent(name)}&photoURL=${encodeURIComponent(
        photoURL
      )}`;

      return res.redirect(redirectURL);
    }
  )(req, res, next);
};
