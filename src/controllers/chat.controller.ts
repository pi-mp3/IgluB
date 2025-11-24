// controllers/chat.controller.ts
import { Request, Response } from 'express';

export const getChatMessages = (req: Request, res: Response) => {
  const dummyMessages = [
    { user: 'Alice', message: 'Hello!' },
    { user: 'Bob', message: 'Hi there!' },
  ];
  res.json(dummyMessages);
};
