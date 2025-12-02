/**
 * editUser.routes.ts
 *
 * Rutas para la edición de usuarios.
 *
 * @module routes/editUser
 */

import { Router } from 'express';
import { editUser } from '../controllers/editUser.controller';

const router = Router();

router.put('/:id', editUser);

export default router;
