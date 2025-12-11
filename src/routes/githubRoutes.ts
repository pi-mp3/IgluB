/**
 * oauthGitHub.ts
 * ---------------------------------------------------------
 * GitHub OAuth REAL implementation.
 * Exchanges OAuth code → GitHub token → user profile.
 * Then creates (or retrieves) the user in Firebase Auth.
 * Finally returns a backend JWT.
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
 * STEP 1: Redirect to GitHub OAuth
 */
router.get("/github", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID!;
  const redirectUri = "http://localhost:5000/api/oauth/github/callback";

  const url =
    `https://github.com/login/oauth/authorize?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    "&scope=read:user user:email";

  res.redirect(url);
});

/**
 * STEP 2: GitHub redirects back with a "code"
 */
router.get("/github/callback", async (req, res) => {
  try {
    const code = req.query.code as string;
    if (!code) return res.status(400).send("Missing code");

    const clientId = process.env.GITHUB_CLIENT_ID!;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET!;

    // 1. Exchange code → GitHub token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token)
      return res.status(401).send("GitHub OAuth failed");

    // 2. Get user email
    const emailRes = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const emails = await emailRes.json();
    const primaryEmail = emails.find((e: any) => e.primary)?.email;

    if (!primaryEmail)
      return res.status(400).send("Email not found in GitHub account");

    // 3. Get GitHub user profile
    const profileRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileRes.json();

    // 4. Create or get Firebase user
    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(primaryEmail);
    } catch {
      firebaseUser = await auth.createUser({
        email: primaryEmail,
        displayName: profile.name,
        photoURL: profile.avatar_url,
      });
    }

    // 5. Generate backend JWT
    const backendToken = jwt.sign(
      {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        provider: "github",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // 6. Redirect to frontend
    res.redirect(
      `http://localhost:5173/oauth/callback?` +
        `token=${backendToken}` +
        `&uid=${firebaseUser.uid}` +
        `&email=${firebaseUser.email}` +
        `&name=${firebaseUser.displayName}` +
        `&provider=github`
    );
  } catch (error) {
    console.error("GitHub OAuth ERROR:", error);
    res.status(500).send("Internal server error");
  }
});

export default router;
