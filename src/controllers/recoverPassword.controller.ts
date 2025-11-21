// src/controllers/recoverPassword.controller.ts
import { Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';
import nodemailer from 'nodemailer';

export const recoverPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const auth = getAuth();
    const resetLink = await auth.generatePasswordResetLink(email);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Your App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });

    return res.json({ message: 'Password reset email sent' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Error generating password reset link', error: error.message });
  }
};
