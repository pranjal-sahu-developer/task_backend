import { Router, Request, Response } from 'express';
import { login } from './controllers/loginController';
import {
  getAllStudents,
  register,
  remove,
  update,
} from './controllers/studentController';
import { asyncHandler } from './middleware/asyncHandler';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'API is running' });
});

router.post('/login', asyncHandler(login));
router.post('/register', asyncHandler(register));
router.get('/students', asyncHandler(getAllStudents));
router.put('/student/:id', asyncHandler(update));
router.delete('/student/:id', asyncHandler(remove));

export default router;
