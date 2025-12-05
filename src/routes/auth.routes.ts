import { Router } from "express";

const router = Router();

// LOGIN MANUAL (email/password)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // TODO: valida con tu DB
  if (email === "test@example.com" && password === "123456") {
    return res.json({
      token: "FAKE_JWT_TOKEN", // aquí genera tu JWT real
      user: { uid: "1", email, name: "Test User" },
    });
  }

  res.status(401).json({ message: "Credenciales incorrectas" });
});

// GOOGLE OAUTH
router.get("/google", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = "http://localhost:5000/auth/google/callback";
  const scope = "openid email profile";

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code provided");

  // TODO: intercambia code por token con Google y busca/crea usuario
  const token = "FAKE_JWT_TOKEN"; 
  const user = { uid: "1", email: "googleuser@example.com", name: "Google User" };

  res.redirect(`http://localhost:5173/oauth/callback?token=${token}&uid=${user.uid}&email=${user.email}&name=${user.name}&provider=google`);
});

export default router;
