// routes/meeting.routes.ts
import { Router } from 'express';
import { createMeeting } from '../controllers/meeting.controller';

const router = Router();
router.post('/create', createMeeting);
export default router;
