/**
 * editUser.controller.ts
 * 
 * Controller to edit user account
 * 
 * @module controllers/editUser
 */

import { Request, Response } from 'express';
import { db } from '../firebase/firebase';

export const editUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    const userRef = db.collection('users').doc(userId);
    await userRef.update(updates);

    return res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
