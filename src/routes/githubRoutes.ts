/**
 * githubRoutes.ts
 *
 * GitHub OAuth Routes
 */

import { Router } from "express";
const router = Router();

router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = "http://localhost:5000/api/auth/github/callback";
  const scope = "read:user user:email";

  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  res.redirect(url);
});

router.get('/github/callback', (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code provided");

  // TODO: Intercambiar code por token real y buscar/crear usuario
  const token = "FAKE_JWT_TOKEN";
  const user = { uid: "2", email: "githubuser@example.com", name: "GitHub User" };

  res.redirect(`http://localhost:5173/oauth/callback?token=${token}&uid=${user.uid}&email=${user.email}&name=${user.name}&provider=github`);
});

export default router;
