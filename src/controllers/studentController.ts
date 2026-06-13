import { Request, Response } from 'express';
import {
  deleteStudent,
  getStudents,
  registerStudent,
  updateStudent,
  validateEncryptedPayload,
  validateEncryptedUpdatePayload,
} from '../services/studentService';

export const register = async (req: Request, res: Response): Promise<void> => {
  const payload = validateEncryptedPayload(req.body);
  const student = await registerStudent(payload);

  res.status(201).json({
    success: true,
    message: 'Student registered successfully',
    data: student,
  });
};

export const getAllStudents = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const students = await getStudents();

  res.status(200).json({
    success: true,
    count: students.length,
    data: students,
  });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const payload = validateEncryptedUpdatePayload(req.body);
  const student = await updateStudent(id, payload);

  res.status(200).json({
    success: true,
    message: 'Student updated successfully',
    data: student,
  });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  await deleteStudent(id);

  res.status(200).json({
    success: true,
    message: 'Student deleted successfully',
  });
};
