/**
 * register.routes.ts
 *
 * Routes for manual login & register (email/password).
 * This version keeps the register endpoint intact and only
 * improves the manual login logic.
 *
 * IMPORTANT:
 * - Replace fake validation with real database logic once ready.
 * - The goal is to provide predictable behavior for frontend and Postman tests.
 */

import { Router } from 'express';
const router = Router();

// =====================================================
// MANUAL LOGIN (email & password)
// =====================================================
/**
 * POST /login
 * Body:
 *  {
 *    "email": "user@example.com",
 *    "password": "123456"
 *  }
 *
 * Description:
 *  Temporary manual login logic.
 *  - Validates that email & password exist.
 *  - Uses a fake test user for now.
 *  - Returns a mock JWT and user info.
 *
 * NOTE:
 *  Replace this with real DB user lookup + password hashing.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check missing fields
  if (!email || !password) {
    return res.status(400).json({
      message: "Missing required fields: email and password"
    });
  }

  // TEMPORARY VALIDATION — replace with real DB logic
  const validEmail = "test@example.com";
  const validPassword = "123456";

  if (email === validEmail && password === validPassword) {
    return res.json({
      message: "Login successful",
      token: "FAKE_JWT_TOKEN",
      user: {
        uid: "1",
        email,
        name: "Test User"
      }
    });
  }

  // Invalid credentials
  return res.status(401).json({
    message: "Invalid credentials"
  });
});

// =====================================================
// MANUAL REGISTER (unchanged, working version)
// =====================================================
/**
 * POST /register
 * Body:
 *  {
 *    "email": "user@example.com",
 *    "password": "123456",
 *    "firstName": "John",
 *    "lastName": "Doe"
 *  }
 *
 * Description:
 *  Temporary manual registration logic.
 *  - Validates required fields.
 *  - Creates a fake user object.
 *  - Returns mock token and new user.
 */
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  const newUser = {
    uid: "2",
    email,
    name: `${firstName || ""} ${lastName || ""}`.trim()
  };

  return res.status(201).json({
    message: "Usuario registrado correctamente",
    user: newUser,
    token: "FAKE_JWT_TOKEN"
  });
});

export default router;
