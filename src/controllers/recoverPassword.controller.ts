/**
 * recoverPassword.controller.ts
 * 
 * Controller to handle password recovery via email using Firebase Authentication.
 * Receives an email, sends a password reset email with a secure link, and returns a response.
 * 
 * @module controllers/recoverPassword
 */

import { Request, Response } from 'express';
import { auth } from '../firebase/firebase';

/**
 * Endpoint to trigger password recovery email
 * POST /api/auth/recover-password
 * 
 * @param {Request} req - Express request object, expects { email: string } in body
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - JSON with success message or error
 */
export const recoverPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Send password reset email via Firebase Auth
    await auth.sendPasswordResetEmail(email);

    return res.json({ message: 'Password recovery email sent successfully' });
  } catch (error: any) {
    console.error(error);

    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
};
