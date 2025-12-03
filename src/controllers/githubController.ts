/**
 * githubController.ts
 *
 * GitHub OAuth 2.0 Controller
 * Final production-ready version.
 * Stable, typed and fully documented in English.
 */

import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import { auth, db } from "../firebase/firebase";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "my_secret_key";
const FRONTEND_URL = process.env.FRONTEND_URL!; // Example: https://your-frontend.vercel.app
const CALLBACK_URL = process.env.GITHUB_REDIRECT_URI!; // Example: http://localhost:5000/api/auth/github/callback

/**
 * GitHub OAuth Strategy Configuration
 */
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: CALLBACK_URL,
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

        if (!email) return done("GitHub did not provide an email");

        let userRecord;

        // Try to fetch user from Firebase
        try {
          userRecord = await auth.getUserByEmail(email);
        } catch {
          userRecord = await auth.createUser({
            email,
            displayName: profile.username || "GitHub User",
          });

          // Save new GitHub user in Firestore
          await db.collection("users").doc(userRecord.uid).set({
            email,
            name: profile.username,
            avatar: profile.photos?.[0]?.value,
            provider: "github",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        return done(null, userRecord);
      } catch (err) {
        return done(err);
      }
    }
  )
);

/**
 * STEP 1 — Redirect user to GitHub
 */
export const githubAuth = passport.authenticate("github");

/**
 * STEP 2 — GitHub redirects back here
 */
export const githubCallback = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "github",
    (err: any, user: any): void => {
      if (err || !user) {
        return res.redirect(`${FRONTEND_URL}/login?error=github-auth-failed`);
      }

      // Generate JWT for frontend
      const token = jwt.sign({ uid: user.uid }, JWT_SECRET, {
        expiresIn: "7d",
      });

      // Final redirect to frontend success page
      return res.redirect(
        `${FRONTEND_URL}/auth/success?token=${token}&uid=${user.uid}`
      );
    }
  )(req, res, next);
};
