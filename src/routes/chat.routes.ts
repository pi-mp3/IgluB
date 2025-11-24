// routes/chat.routes.ts
import { Router } from 'express';
import { getChatMessages } from '../controllers/chat.controller';

const router = Router();
router.get('/', getChatMessages);
export default router;
