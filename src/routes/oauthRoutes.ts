/**
 * oauthRoutes.ts
 *
 * Google OAuth Routes
 */

import { Router } from 'express';
const router = Router();

router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = "http://localhost:5000/api/auth/google/callback";
  const scope = "openid email profile";

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code provided");

  // TODO: Intercambiar code por token real y buscar/crear usuario
  const token = "FAKE_JWT_TOKEN";
  const user = { uid: "1", email: "googleuser@example.com", name: "Google User" };

  // Redirect to frontend OAuth callback
  res.redirect(`http://localhost:5173/oauth/callback?token=${token}&uid=${user.uid}&email=${user.email}&name=${user.name}&provider=google`);
});

export default router;
