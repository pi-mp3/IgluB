/**
 * register.routes.ts
 *
 * Manual login & register routes (email/password)
 */

import { Router } from 'express';
const router = Router();

// ----------------------------
// Manual login
// ----------------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // TODO: Replace with real DB validation
  if (email === "test@example.com" && password === "123456") {
    return res.json({
      token: "FAKE_JWT_TOKEN",
      user: { uid: "1", email, name: "Test User" }
    });
  }

  res.status(401).json({ message: "Credenciales incorrectas" });
});

// ----------------------------
// Manual register
// ----------------------------
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // TODO: Replace with real DB insertion
  if (!email || !password) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  // Fake user creation
  const newUser = {
    uid: "2", // generate real UID in DB
    email,
    name: `${firstName || ""} ${lastName || ""}`.trim()
  };

  return res.status(201).json({
    message: "Usuario registrado correctamente",
    user: newUser,
    token: "FAKE_JWT_TOKEN" // generate real JWT
  });
});

export default router;
