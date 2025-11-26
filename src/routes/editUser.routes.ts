/**
 * editUser.routes.ts
 * 
 * Routes for editing user account
 * 
 * @module routes/editUser
 */

import { Router } from 'express';
import { editUser } from '../controllers/editUser.controller';

const router = Router();

/**
 * PUT /api/user/:id
 * Edit user account by ID
 */
router.put('/user/:id', editUser);

export default router;
