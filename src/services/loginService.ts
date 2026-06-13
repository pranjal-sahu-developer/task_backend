import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { decryptLevel1, decryptLevel2 } from '../utils/encryption';
import { findStudentForLogin } from '../utils/emailLookup';
import { createAppError } from '../utils/AppError';
import { getJwtSecret } from '../utils/jwt';
import { validatePasswordStrength } from '../utils/validation';
import { LoginPayload } from '../types/auth.types';

export const validateLoginPayload = (
  data: Partial<LoginPayload>,
): LoginPayload => {
  const missingFields: string[] = [];

  if (typeof data.email !== 'string' || data.email.trim() === '') {
    missingFields.push('email');
  }

  if (typeof data.password !== 'string' || data.password.trim() === '') {
    missingFields.push('password');
  }

  if (missingFields.length > 0) {
    throw createAppError(
      `Missing or invalid fields: ${missingFields.join(', ')}`,
      400,
    );
  }

  return {
    email: data.email!.trim(),
    password: data.password!.trim(),
  };
};

export const loginUser = async (
  payload: LoginPayload,
): Promise<{ token: string }> => {
  const student = await findStudentForLogin(payload.email);

  if (!student) {
    throw createAppError('Invalid email or password', 401);
  }

  let loginPassword: string;

  try {
    loginPassword = decryptLevel1(payload.password);
    validatePasswordStrength(loginPassword);
  } catch (error) {
    if (
      error instanceof Error &&
      'statusCode' in error &&
      (error as { statusCode?: number }).statusCode === 400
    ) {
      throw createAppError('Invalid email or password', 401);
    }

    throw createAppError('Invalid email or password', 401);
  }

  const storedPasswordHash = decryptLevel2(student.password);
  const isPasswordValid = await bcrypt.compare(
    loginPassword,
    storedPasswordHash,
  );

  if (!isPasswordValid) {
    throw createAppError('Invalid email or password', 401);
  }

  const decryptedEmail = decryptLevel2(student.email);

  const token = jwt.sign(
    {
      id: student._id.toString(),
      email: decryptedEmail,
    },
    getJwtSecret(),
    { expiresIn: '7d' },
  );

  return { token };
};

