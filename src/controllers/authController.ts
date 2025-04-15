import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Register new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, phoneNumber, email, password } = req.body;
    if (!name || !phoneNumber || !password) {
      return res.status(400).json({ error: 'Name, phone number, and password are required.' });
    }
    // Ensure phone number is unique
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Phone number already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, phoneNumber, email, password: hashedPassword },
    });
    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
      return res.status(400).json({ error: 'Phone number and password are required.' });
    }
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};
