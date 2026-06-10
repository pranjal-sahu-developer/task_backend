import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createAppError } from '../utils/AppError';
import { getJwtSecret } from '../utils/jwt';
import { JwtPayload } from '../types/auth.types';

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next(createAppError('Access denied. No token provided', 401));
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      next(createAppError('Access denied. No token provided', 401));
      return;
    }

    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    next(createAppError('Invalid or expired token', 401));
  }
};
