import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Search by name: results sorted with names starting with query first
export const searchByName = async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required.' });
    }
    // First, users whose names start with the query
    const startsWith = await prisma.user.findMany({
      where: {
        name: { startsWith: query, mode: 'insensitive' },
      },
      select: { id: true, name: true, phoneNumber: true },
    });
    // Then, users whose names contain the query but do not start with it
    const contains = await prisma.user.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      select: { id: true, name: true, phoneNumber: true },
    });
    
    
    const filteredContains = contains.filter(
      (user: { name: string }) => !user.name.toLowerCase().startsWith(query.toLowerCase())
    );
    
    const results = [...startsWith, ...contains];

    // For each result, calculate spam likelihood (e.g., count of spam marks)
    const resultsWithSpam = await Promise.all(results.map(async (user) => {
      const spamCount = await prisma.spamMark.count({
        where: { phoneNumber: user.phoneNumber },
      });
      return { ...user, spamCount };
    }));
    res.json(resultsWithSpam);
  } catch (error) {
    res.status(500).json({ error: 'Search by name failed' });
  }
};

// Search by phone number
export const searchByPhone = async (req: Request, res: Response) => {
  try {
    const phone = req.query.phone as string;
    if (!phone) {
      return res.status(400).json({ error: 'Phone parameter is required.' });
    }
    // Check if there is a registered user with this phone number
    const registeredUser = await prisma.user.findUnique({
      where: { phoneNumber: phone },
      select: { id: true, name: true, phoneNumber: true },
    });
    if (registeredUser) {
      const spamCount = await prisma.spamMark.count({
        where: { phoneNumber: registeredUser.phoneNumber },
      });
      return res.json([{ ...registeredUser, spamCount }]);
    }
    
    const contacts = await prisma.contact.findMany({
      where: { phoneNumber: phone },
      select: { id: true, name: true, phoneNumber: true, userId: true },
    });
    
    const results = await Promise.all(contacts.map(async (contact: { id: number; name: string; phoneNumber: string; userId: number }) => {
      const spamCount = await prisma.spamMark.count({
        where: { phoneNumber: contact.phoneNumber },
      });
      return { ...contact, spamCount };
    }));
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Search by phone failed' });
  }
};

// Get full details for a person
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const requesterId = (req as any).user.userId; 

    
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the requester is in the user's contact list
    const isInContactList = await prisma.contact.findFirst({
      where: {
        userId: user.id, 
        phoneNumber: (await prisma.user.findUnique({ where: { id: requesterId } }))?.phoneNumber, 
      },
    });

    // Calculate spam likelihood
    const spamCount = await prisma.spamMark.count({
      where: { phoneNumber: user.phoneNumber },
    });

    
    const responseData: any = {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      spamCount,
    };

    // Include email only if the requester is in the user's contact list
    if (isInContactList) {
      responseData.email = user.email;
    }

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user details' });
  }
};
