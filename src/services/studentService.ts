import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { Student, IStudent } from '../models/Student';
import {
  decryptLevel1,
  decryptLevel2,
  encryptLevel1,
  encryptLevel2,
} from '../utils/encryption';
import { createAppError } from '../utils/AppError';
import {
  assertEmailAvailable,
  createEmailLookup,
} from '../utils/emailLookup';
import {
  PlainStudentFields,
  validatePlainStudentFields,
} from '../utils/validation';
import { BCRYPT_SALT_ROUNDS } from '../types/auth.types';
import {
  EncryptedStudentPayload,
  EncryptedStudentUpdatePayload,
  ENCRYPTED_STUDENT_FIELDS,
  StudentResponse,
} from '../types/student.types';

const ENCRYPTED_STUDENT_UPDATE_FIELDS = ENCRYPTED_STUDENT_FIELDS.filter(
  (field) => field !== 'password',
);

const toPlainStudentFields = (
  data: EncryptedStudentPayload,
): PlainStudentFields => ({
  fullName: decryptLevel1(data.fullName),
  email: decryptLevel1(data.email),
  phoneNumber: decryptLevel1(data.phoneNumber),
  dateOfBirth: decryptLevel1(data.dateOfBirth),
  gender: decryptLevel1(data.gender),
  address: decryptLevel1(data.address),
  courseEnrolled: decryptLevel1(data.courseEnrolled),
  password: decryptLevel1(data.password),
});

const toPlainUpdateFields = (
  data: EncryptedStudentUpdatePayload,
): PlainStudentFields => ({
  fullName: decryptLevel1(data.fullName),
  email: decryptLevel1(data.email),
  phoneNumber: decryptLevel1(data.phoneNumber),
  dateOfBirth: decryptLevel1(data.dateOfBirth),
  gender: decryptLevel1(data.gender),
  address: decryptLevel1(data.address),
  courseEnrolled: decryptLevel1(data.courseEnrolled),
  password:
    typeof data.password === 'string' && data.password.trim() !== ''
      ? decryptLevel1(data.password)
      : undefined,
});

const encryptFields = async (
  data: EncryptedStudentPayload,
): Promise<EncryptedStudentPayload> => {
  const encrypted = {} as EncryptedStudentPayload;

  for (const field of ENCRYPTED_STUDENT_FIELDS) {
    const plainValue = decryptLevel1(data[field]);

    if (field === 'password') {
      const hashedPassword = await bcrypt.hash(plainValue, BCRYPT_SALT_ROUNDS);
      encrypted[field] = encryptLevel2(hashedPassword);
    } else {
      encrypted[field] = encryptLevel2(plainValue);
    }
  }

  return encrypted;
};

const encryptFieldsForUpdate = async (
  data: EncryptedStudentUpdatePayload,
  existingStudent: IStudent,
): Promise<EncryptedStudentPayload> => {
  const encrypted = {} as EncryptedStudentPayload;

  for (const field of ENCRYPTED_STUDENT_UPDATE_FIELDS) {
    const plainValue = decryptLevel1(data[field]);
    encrypted[field] = encryptLevel2(plainValue);
  }

  if (typeof data.password === 'string' && data.password.trim() !== '') {
    const plainPassword = decryptLevel1(data.password);
    const hashedPassword = await bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
    encrypted.password = encryptLevel2(hashedPassword);
  } else {
    encrypted.password = existingStudent.password;
  }

  return encrypted;
};

const decryptFields = (student: IStudent): StudentResponse => {
  const decrypted = {} as StudentResponse;

  decrypted._id = student._id.toString();
  decrypted.createdAt = student.createdAt.toISOString();
  decrypted.updatedAt = student.updatedAt.toISOString();

  for (const field of ENCRYPTED_STUDENT_FIELDS) {
    const plainValue = decryptLevel2(student[field]);

    if (field === 'password') {
      decrypted[field] = encryptLevel1('redacted');
      continue;
    }

    decrypted[field] = encryptLevel1(plainValue);
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

  const payload = data as EncryptedStudentPayload;

  try {
    validatePlainStudentFields(toPlainStudentFields(payload), {
      requirePassword: true,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'EncryptionError') {
      throw createAppError('Invalid encrypted field data', 400);
    }

    throw error;
  }

  return payload;
};

export const validateEncryptedUpdatePayload = (
  data: Partial<EncryptedStudentUpdatePayload>,
): EncryptedStudentUpdatePayload => {
  const missingFields = ENCRYPTED_STUDENT_UPDATE_FIELDS.filter(
    (field) => typeof data[field] !== 'string' || data[field]!.trim() === '',
  );

  if (missingFields.length > 0) {
    throw createAppError(
      `Missing or invalid fields: ${missingFields.join(', ')}`,
      400,
    );
  }

  const payload = data as EncryptedStudentUpdatePayload;

  try {
    validatePlainStudentFields(toPlainUpdateFields(payload), {
      requirePassword: false,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'EncryptionError') {
      throw createAppError('Invalid encrypted field data', 400);
    }

    throw error;
  }

  return payload;
};

const validateObjectId = (id: string): void => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createAppError('Invalid student ID', 400);
  }
};

export const registerStudent = async (
  payload: EncryptedStudentPayload,
): Promise<StudentResponse> => {
  const plainEmail = await assertEmailAvailable(payload.email);
  const encryptedData = await encryptFields(payload);
  const student = await Student.create({
    ...encryptedData,
    emailLookup: createEmailLookup(plainEmail),
  });

  return decryptFields(student);
};

export const getStudents = async (): Promise<StudentResponse[]> => {
  const students = await Student.find().sort({ createdAt: -1 });
  return students.map(decryptFields);
};

export const updateStudent = async (
  id: string,
  payload: EncryptedStudentUpdatePayload,
): Promise<StudentResponse> => {
  validateObjectId(id);

  const existingStudent = await Student.findById(id);

  if (!existingStudent) {
    throw createAppError('Student not found', 404);
  }

  const plainEmail = await assertEmailAvailable(payload.email, id);
  const encryptedData = await encryptFieldsForUpdate(payload, existingStudent);
  const student = await Student.findByIdAndUpdate(
    id,
    {
      ...encryptedData,
      emailLookup: createEmailLookup(plainEmail),
    },
    {
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
