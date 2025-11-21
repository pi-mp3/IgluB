import { Router } from 'express';
import { registerUser, loginManual, loginGoogle, loginFacebook, logout } from '../controllers/register.controller';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginManual);
router.post('/login/google', loginGoogle);
router.post('/login/facebook', loginFacebook);
router.post('/logout', logout);

export default router;
