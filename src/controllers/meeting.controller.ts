// controllers/meeting.controller.ts
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const createMeeting = (req: Request, res: Response) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });

  const meetingId = uuidv4(); // genera un ID único
  return res.json({ meetingId, title });
};
