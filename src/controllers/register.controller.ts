import { Request, Response } from 'express';
import { db } from '../firebase/firebase';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/register';

// Facebook requiere require para TS
const FB = require('fb');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const SALT_ROUNDS = 10;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Manual user registration
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Missing required fields' });

    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).get();
    if (!snapshot.empty)
      return res.status(400).json({ message: 'User already registered' });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser: User = {
      name,
      email,
      password: hashedPassword,
      authProvider: 'manual',
      createdAt: new Date()
    };

    const docRef = await userRef.add(newUser);
    return res.status(201).json({ id: docRef.id, message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Manual login
 */
export const loginManual = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Missing required fields' });

    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).get();
    if (snapshot.empty)
      return res.status(400).json({ message: 'User not found' });

    const userData = snapshot.docs[0].data() as User;
    const userId = snapshot.docs[0].id;

    const match = await bcrypt.compare(password, userData.password || '');
    if (!match)
      return res.status(401).json({ message: 'Incorrect password' });

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token, message: 'Login successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Google OAuth login
 */
export const loginGoogle = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken)
      return res.status(400).json({ message: 'Token is required' });

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload)
      return res.status(401).json({ message: 'Invalid token' });

    const { email, name, sub: googleId } = payload;

    if (!email || !name || !googleId)
      return res.status(400).json({ message: 'Incomplete info from Google token' });

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

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token, message: 'Login successful with Google' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Facebook OAuth login
 */
export const loginFacebook = async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken)
      return res.status(400).json({ message: 'Access token required' });

    // Call Facebook Graph API
    const fbResponse: any = await FB.api('me', {
      fields: ['id', 'name', 'email'],
      access_token: accessToken
    });

    const { id: facebookId, name, email } = fbResponse;

    if (!facebookId || !email || !name)
      return res.status(400).json({ message: 'Incomplete info from Facebook' });

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

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token, message: 'Login successful with Facebook' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Logout (frontend removes token)
 */
export const logout = (_req: Request, res: Response) => {
  return res.json({ message: 'Logout successful, remove token on frontend' });
};
