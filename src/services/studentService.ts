import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { Student, IStudent } from '../models/Student';
import { encryptLevel2, decryptLevel2 } from '../utils/encryption';
import { createAppError } from '../utils/AppError';
import { BCRYPT_SALT_ROUNDS } from '../types/auth.types';
import {
  EncryptedStudentPayload,
  ENCRYPTED_STUDENT_FIELDS,
  StudentResponse,
} from '../types/student.types';

const encryptFields = async (
  data: EncryptedStudentPayload,
): Promise<EncryptedStudentPayload> => {
  const encrypted = {} as EncryptedStudentPayload;

  for (const field of ENCRYPTED_STUDENT_FIELDS) {
    if (field === 'password') {
      const hashedPassword = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
      encrypted[field] = encryptLevel2(hashedPassword);
    } else {
      encrypted[field] = encryptLevel2(data[field]);
    }
  }

  return encrypted;
};

const decryptFields = (student: IStudent): StudentResponse => {
  const decrypted = {} as StudentResponse;

  decrypted._id = student._id.toString();
  decrypted.createdAt = student.createdAt.toISOString();
  decrypted.updatedAt = student.updatedAt.toISOString();

  for (const field of ENCRYPTED_STUDENT_FIELDS) {
    decrypted[field] = decryptLevel2(student[field]);
  }

  return decrypted;
};

export const validateEncryptedPayload = (
  data: Partial<EncryptedStudentPayload>,
): EncryptedStudentPayload => {
  const missingFields = ENCRYPTED_STUDENT_FIELDS.filter(
    (field) => typeof data[field] !== 'string' || data[field]!.trim() === '',
  );

  if (missingFields.length > 0) {
    throw createAppError(
      `Missing or invalid fields: ${missingFields.join(', ')}`,
      400,
    );
  }

  return data as EncryptedStudentPayload;
};

const validateObjectId = (id: string): void => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createAppError('Invalid student ID', 400);
  }
};

export const registerStudent = async (
  payload: EncryptedStudentPayload,
): Promise<StudentResponse> => {
  const encryptedData = await encryptFields(payload);
  const student = await Student.create(encryptedData);

  return decryptFields(student);
};

export const getStudents = async (): Promise<StudentResponse[]> => {
  const students = await Student.find().sort({ createdAt: -1 });
  return students.map(decryptFields);
};

export const updateStudent = async (
  id: string,
  payload: EncryptedStudentPayload,
): Promise<StudentResponse> => {
  validateObjectId(id);

  const encryptedData = await encryptFields(payload);
  const student = await Student.findByIdAndUpdate(id, encryptedData, {
    new: true,
    runValidators: true,
  });

  if (!student) {
    throw createAppError('Student not found', 404);
  }

  return decryptFields(student);
};

export const deleteStudent = async (id: string): Promise<void> => {
  validateObjectId(id);

  const student = await Student.findByIdAndDelete(id);

  if (!student) {
    throw createAppError('Student not found', 404);
  }
};
