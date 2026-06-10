import { createAppError } from './AppError';

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.trim() === '') {
    throw createAppError(
      'JWT_SECRET is not defined in environment variables',
      500,
    );
  }

  return secret;
};
