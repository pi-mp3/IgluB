/**
 * deleteUser.controller.ts
 *
 * Controller to delete a user completely:
 * - Firestore document
 * - Firebase Authentication account
 * Technical documentation in English; user-facing messages in Spanish.
 */

import { Request, Response } from "express";
import { db, auth } from "../firebase/firebase";

/**
 * Deletes a user by UID from Firestore and Firebase Auth.
 */
export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  const uid = req.params.id;

  try {
    const querySnapshot = await db.collection("users")
        .where("uid", "==", uid)
        .limit(1)
        .get();

    if (querySnapshot.empty) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: `No existe un usuario con uid ${uid}`
      });
    }

    const docId = querySnapshot.docs[0].id;
    await db.collection("users").doc(docId).delete();
    await auth.deleteUser(uid);

    return res.status(200).json({
      message: `Usuario con uid ${uid} eliminado correctamente`
    });

  } catch (err: any) {
    console.error("Error eliminando usuario:", err);
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: err.message
    });
  }
};
