
import { Request, Response } from 'express';
import { auth, db } from '../firebase';
import { User } from '../models/User';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, ...data } = req.body as User & { password: string };
    const userRecord = await auth.createUser({ email, password });
    await db.collection('users').doc(userRecord.uid).set(data);
    return res.json({ uid: userRecord.uid });
  } catch (err:any) {
    return res.status(400).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  return res.json({ message: "Login uses Firebase client SDK." });
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    await db.collection('users').doc(req.params.id).update(req.body);
    return res.json({ updated: true });
  } catch (err:any) {
    return res.status(400).json({ error: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await auth.deleteUser(req.params.id);
    await db.collection('users').doc(req.params.id).delete();
    return res.json({ deleted: true });
  } catch (err:any) {
    return res.status(400).json({ error: err.message });
  }
};

export const recoverPassword = async (req: Request, res: Response) => {
  return res.json({ message: "Use Firebase client SDK for password reset." });
};
