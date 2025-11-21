/**
 * deleteUser.routes.ts
 * 
 * Routes for deleting user account
 * 
 * @module routes/deleteUser
 */

import { Router } from 'express';
import { deleteUser } from '../controllers/deleteUser.controller';

const router = Router();

/**
 * DELETE /api/user/:id
 * Delete user account by ID
 */
router.delete('/user/:id', deleteUser);

export default router;
