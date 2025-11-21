/**
 * oauthController.ts
 * 
 * Controller to handle Google OAuth2 callback.
 * Receives the code from Google, exchanges it for tokens,
 * verifies the id_token, creates or fetches the user, 
 * and returns a JWT.
 * 
 * @module controllers/oauthController
 */

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { db } from '../firebase/firebase';
import { User } from '../models/register';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

/**
 * Google OAuth2 callback endpoint
 * URL: /api/auth/google/callback
 * 
 * @param {Request} req - Express request object, expects query param `code`
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - JSON with JWT token or error
 */
export const oauthCallback = async (req: Request, res: Response): Promise<Response> => {
  try {
    const code = req.query.code as string;

    if (!code) {
      return res.status(400).json({ message: 'Code query parameter is missing' });
    }

    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    // Verify id_token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    const { email, name, sub: googleId } = payload;

    if (!email || !name || !googleId) {
      return res.status(400).json({ message: 'Incomplete info from Google token' });
    }

    // Check if user exists in Firestore
    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).get();

    let userId: string;
    if (snapshot.empty) {
      const newUser: User = {
        name,
        email,
        authProvider: 'google',
        oauthId: googleId,
        createdAt: new Date()
      };
      const docRef = await userRef.add(newUser);
      userId = docRef.id;
    } else {
      userId = snapshot.docs[0].id;
    }

    // Generate JWT token
    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '2h' });

    return res.json({ token, message: 'Login successful with Google' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

