
import { Router } from 'express';
import { register, login, updateUser, deleteUser, recoverPassword } from '../controllers/user.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/recover', recoverPassword);

export default router;
