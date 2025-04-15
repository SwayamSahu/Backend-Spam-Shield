import { Router } from 'express';
import { markSpam } from '../controllers/spamController';

const router = Router();

const asyncHandler = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// POST /spam to mark a number as spam
router.post('/', asyncHandler(markSpam));

export default router;
