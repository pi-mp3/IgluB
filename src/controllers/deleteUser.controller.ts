/**
 * deleteUser.controller.ts
 * 
 * Controller to delete user account
 * 
 * @module controllers/deleteUser
 */

import { Request, Response } from 'express';
import { db } from '../firebase/firebase';

export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.params.id;
    await db.collection('users').doc(userId).delete();

    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
