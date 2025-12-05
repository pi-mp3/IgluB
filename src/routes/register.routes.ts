import { Router } from 'express';
import { registerUser, loginManual, loginGoogle, logout } from '../controllers/register.controller';

const router = Router();

router.post('/register', registerUser);      // Registro manual
router.post('/login', loginManual);          // Login manual
router.post('/login/google', loginGoogle);   // Login Google
router.post('/logout', logout);              // Logout

export default router;
