import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();


const asyncHandler = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// POST /auth/register
router.post('/register', asyncHandler(register));

// POST /auth/login
router.post('/login', asyncHandler(login));

export default router;
