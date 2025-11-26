// src/controllers/facebookController.ts

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { auth, db } from '../firebase/firebase';
import { User } from '../models/register';

const FB = require('fb');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

/**
 * Facebook OAuth login handler.
 * Receives a Facebook access token from the client, fetches user data from Facebook,
 * creates or retrieves the user in Firebase Auth and Firestore, and returns a JWT.
 *
 * POST /api/auth/facebook
 *
 * @param {Request} req - Express request object. Expects `accessToken` in the body.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} JSON response containing a JWT token or an error.
 */
export const facebookOAuthCallback = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ message: 'Access token is required' });
    }

    // Fetch user profile from Facebook
    const fbResponse: any = await FB.api('me', {
      fields: ['id', 'name', 'email'],
      access_token: accessToken,
    });

    const { id: facebookId, name, email } = fbResponse;
    if (!facebookId || !name || !email) {
      return res.status(400).json({ message: 'Incomplete info from Facebook' });
    }

    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).get();

    let userId: string;
    if (snapshot.empty) {
      // Create user in Firebase Auth to get a UID
      const userRecord = await auth.createUser({
        email,
        displayName: name,
      });

      // Build the user object for Firestore
      const newUser: User = {
        name,
        lastName: '',         // default or empty if not provided
        age: 0,               // default value
        email,
        password: '',         // not used for OAuth
        authProvider: 'facebook',
        oauthId: facebookId,
        createdAt: new Date(),
        uid: userRecord.uid,  // use the Auth UID
      };

      // Save to Firestore using the UID as document ID
      await userRef.doc(userRecord.uid).set(newUser);
      userId = userRecord.uid;
    } else {
      // If user exists, get their Firestore document ID (should match uid)
      userId = snapshot.docs[0].id;
    }

    // Generate a JWT for backend usage
    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '2h' });

    return res.json({ token, message: 'Login successful with Facebook' });
  } catch (err) {
    console.error('FACEBOOK OAUTH ERROR:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
