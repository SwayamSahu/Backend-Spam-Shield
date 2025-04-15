import { Router } from 'express';
import { searchByName, searchByPhone, getUserDetails } from '../controllers/searchController';

const router = Router();


const asyncHandler = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// GET /search/name?query=...
router.get('/name', asyncHandler(searchByName));

// GET /search/phone?phone=...
router.get('/phone', asyncHandler(searchByPhone));

// GET /search/details/:id
router.get('/details/:id', asyncHandler(getUserDetails));

export default router;
