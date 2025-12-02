/**
 * getUser.routes.ts
 *
 * Rutas para obtener información de un usuario desde Firestore.
 * Esta ruta soporta búsqueda por UID de Firebase incluso si el ID del documento es diferente.
 *
 * @module routes/getUser
 */

import { Router } from 'express';
import { db } from '../firebase/firebase'; // Firestore
import admin from '../firebase/firebase'; // Firebase Auth también disponible

const router = Router();

/**
 * @route GET /api/user/:id
 * @description Obtiene un usuario de la colección "users" por su UID de Firebase.
 *
 * @param {string} req.params.id - UID de Firebase Auth
 *
 * @returns {Object} 200 - Datos del usuario
 * @returns {Object} 404 - Usuario no encontrado
 * @returns {Object} 500 - Error interno del servidor
 */
router.get('/:id', async (req, res) => {
    const uid = req.params.id;

    try {
        const querySnapshot = await db.collection('users')
            .where('uid', '==', uid)
            .limit(1)
            .get();

        if (querySnapshot.empty) {
            return res.status(404).json({
                error: 'Usuario no encontrado',
                message: `No existe un usuario con uid ${uid}`
            });
        }

        const doc = querySnapshot.docs[0];
        return res.status(200).json({ id: doc.id, ...doc.data() });

    } catch (error: any) {
        console.error("Error obteniendo usuario:", error);
        return res.status(500).json({
            error: "Error interno del servidor",
            details: error.message
        });
    }
});

export default router;
