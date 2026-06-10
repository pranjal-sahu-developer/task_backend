import { Request, Response } from 'express';
import { loginUser, validateLoginPayload } from '../services/loginService';

export const login = async (req: Request, res: Response): Promise<void> => {
  const payload = validateLoginPayload(req.body);
  const { token } = await loginUser(payload);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
  });
};
