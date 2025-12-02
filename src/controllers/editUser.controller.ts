/**
 * editUser.controller.ts
 *
 * Controller to edit user account information.
 * Technical documentation in English; user-facing messages in Spanish.
 */

import { Request, Response } from "express";
import { auth, db } from "../firebase/firebase";



/**
 * Edits a user's Firestore document by UID.
 */
export const editUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    const querySnapshot = await db.collection('users')
        .where('uid', '==', userId)
        .limit(1)
        .get();

    if (querySnapshot.empty) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: `No existe un usuario con uid ${userId}`
      });
    }

    const docId = querySnapshot.docs[0].id;
    await db.collection('users').doc(docId).update(updates);

    return res.json({ message: 'Usuario actualizado correctamente' });

  } catch (err: any) {
    console.error("Error actualizando usuario:", err);
    return res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
};
