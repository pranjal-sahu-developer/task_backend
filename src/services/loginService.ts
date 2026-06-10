import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Student, IStudent } from '../models/Student';
import { decryptLevel2 } from '../utils/encryption';
import { createAppError } from '../utils/AppError';
import { getJwtSecret } from '../utils/jwt';
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

const findUserByEmail = async (
  frontendEncryptedEmail: string,
): Promise<IStudent | null> => {
  const students = await Student.find();

  for (const student of students) {
    try {
      const decryptedEmail = decryptLevel2(student.email);

      if (decryptedEmail === frontendEncryptedEmail) {
        return student;
      }
    } catch {
      continue;
    }
  }

  return null;
};

export const loginUser = async (
  payload: LoginPayload,
): Promise<{ token: string }> => {
  const student = await findUserByEmail(payload.email);

  if (!student) {
    throw createAppError('Invalid email or password', 401);
  }

  const storedPasswordHash = decryptLevel2(student.password);
  const isPasswordValid = await bcrypt.compare(
    payload.password,
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

