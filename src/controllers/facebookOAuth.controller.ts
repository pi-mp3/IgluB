/**
 * facebookController.ts
 * 
 * Controller to handle Facebook OAuth login.
 * Receives the access token from the client, fetches user info from Facebook Graph API,
 * creates or fetches the user in Firestore, and returns a JWT.
 * 
 * @module controllers/facebookController
 */

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../firebase/firebase';
import { User } from '../models/register';

// Facebook SDK for Node (require for TS)
const FB = require('fb');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

/**
 * Facebook OAuth callback endpoint
 * URL: /api/auth/facebook/callback
 * 
 * @param {Request} req - Express request object, expects body param `accessToken`
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - JSON with JWT token or error
 */
export const facebookOAuthCallback = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: 'Access token is required' });
    }

    // Fetch user info from Facebook
    const fbResponse: any = await FB.api('me', {
      fields: ['id', 'name', 'email'],
      access_token: accessToken
    });

    const { id: facebookId, name, email } = fbResponse;

    if (!facebookId || !name || !email) {
      return res.status(400).json({ message: 'Incomplete info from Facebook' });
    }

    // Check if user exists
    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).get();

    let userId: string;
    if (snapshot.empty) {
      const newUser: User = {
        name,
        email,
        authProvider: 'facebook',
        oauthId: facebookId,
        createdAt: new Date()
      };
      const docRef = await userRef.add(newUser);
      userId = docRef.id;
    } else {
      userId = snapshot.docs[0].id;
    }

    // Generate JWT
    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '2h' });

    return res.json({ token, message: 'Login successful with Facebook' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

