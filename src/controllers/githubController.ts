/**
 * githubController.ts
 *
 * GitHub OAuth controller.
 * Fully typed and stable.
 */

import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import { auth, db } from "../firebase/firebase";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "my_secret_key";
const FRONTEND_URL = process.env.FRONTEND_URL!;
const REDIRECT_URI = process.env.GITHUB_REDIRECT_URI!;

/**
 * Configure GitHub OAuth Strategy
 */
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: REDIRECT_URI,
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
        if (!email) return done("GitHub no proporcionó email");

        let userRecord;

        // Check if Firebase user exists
        try {
          userRecord = await auth.getUserByEmail(email);
        } catch {
          // Create user if not found
          userRecord = await auth.createUser({
            email,
            displayName: profile.username || "GitHub User",
          });

          // Store data in firestore
          await db.collection("users").doc(userRecord.uid).set({
            email,
            name: profile.username,
            avatar: profile.photos?.[0]?.value,
            provider: "github",
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
 * Step 1: Redirect to GitHub
 */
export const githubAuth = passport.authenticate("github");

/**
 * Step 2: GitHub redirects back here
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

      // Create JWT for the frontend
      const token = jwt.sign({ uid: user.uid }, JWT_SECRET, {
        expiresIn: "7d",
      });

      // Final redirect to your frontend
      return res.redirect(
        `${FRONTEND_URL}/auth/success?token=${token}&uid=${user.uid}`
      );
    }
  )(req, res, next);
};
