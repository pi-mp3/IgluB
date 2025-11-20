import { Router } from 'express';
import { register, login, updateUser, deleteUser, recoverPassword } from '../controllers/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.put('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);
router.post('/recover', recoverPassword);

export default router;
