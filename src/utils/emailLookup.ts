import crypto from 'crypto';
import { Student, IStudent } from '../models/Student';
import { decryptLevel1, decryptLevel2 } from './encryption';
import { createAppError } from './AppError';

export const trimEmail = (email: string): string => email.trim();

export const normalizeEmailForLookup = (email: string): string =>
  email.trim().toLowerCase();

export const createEmailLookup = (plainEmail: string): string =>
  crypto
    .createHash('sha256')
    .update(normalizeEmailForLookup(plainEmail))
    .digest('hex');

export const findStudentByPlainEmail = async (
  plainEmail: string,
): Promise<IStudent | null> => {
  const normalized = normalizeEmailForLookup(plainEmail);
  const emailLookup = createEmailLookup(normalized);

  const byLookup = await Student.findOne({ emailLookup });
  if (byLookup) {
    return byLookup;
  }

  const students = await Student.find();

  for (const student of students) {
    try {
      const storedEmail = normalizeEmailForLookup(decryptLevel2(student.email));

      if (storedEmail === normalized) {
        return student;
      }
    } catch {
      continue;
    }
  }

  return null;
};

export const findStudentForLogin = async (
  clientEncryptedEmail: string,
): Promise<IStudent | null> => {
  let loginEmail: string;

  try {
    loginEmail = trimEmail(decryptLevel1(clientEncryptedEmail));
  } catch {
    return null;
  }

  const students = await Student.find();

  for (const student of students) {
    try {
      const storedEmail = trimEmail(decryptLevel2(student.email));

      if (storedEmail === loginEmail) {
        return student;
      }
    } catch {
      continue;
    }
  }

  return null;
};

export const assertEmailAvailable = async (
  clientEncryptedEmail: string,
  excludeStudentId?: string,
): Promise<string> => {
  let plainEmail: string;

  try {
    plainEmail = trimEmail(decryptLevel1(clientEncryptedEmail));
  } catch {
    throw createAppError('Invalid email', 400);
  }

  const existingStudent = await findStudentByPlainEmail(plainEmail);

  if (
    existingStudent &&
    (!excludeStudentId || existingStudent._id.toString() !== excludeStudentId)
  ) {
    throw createAppError('A student with this email already exists', 409);
  }

  return plainEmail;
};
