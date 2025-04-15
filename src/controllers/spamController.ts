import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const markSpam = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }
    const userId = (req as any).user.userId;
    await prisma.spamMark.create({
      data: { phoneNumber, userId },
    });
    res.status(201).json({ message: 'Number marked as spam.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark spam' });
  }
};
