export interface EncryptedStudentPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  courseEnrolled: string;
  password: string;
}

export interface StudentResponse extends EncryptedStudentPayload {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export const ENCRYPTED_STUDENT_FIELDS: (keyof EncryptedStudentPayload)[] = [
  'fullName',
  'email',
  'phoneNumber',
  'dateOfBirth',
  'gender',
  'address',
  'courseEnrolled',
  'password',
];
