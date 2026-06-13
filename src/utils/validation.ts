import { createAppError } from './AppError';

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
export const PHONE_PATTERN = /^\+91\d{10}$/;
export const MIN_PASSWORD_LENGTH = 8;

export const GENDER_OPTIONS = ['Male', 'Female', 'Other'] as const;
export const COURSE_OPTIONS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical Engineering',
  'Business Administration',
  'Data Science',
] as const;

export interface PlainStudentFields {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  courseEnrolled: string;
  password?: string;
}

export const validateEmailFormat = (email: string): void => {
  if (!EMAIL_PATTERN.test(email.trim())) {
    throw createAppError('Enter a valid email address', 400);
  }
};

export const validatePasswordStrength = (password: string): void => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw createAppError('Password must be at least 8 characters', 400);
  }

  if (!PASSWORD_PATTERN.test(password)) {
    throw createAppError(
      'Password must include uppercase, lowercase, and a number',
      400,
    );
  }
};

export const validatePlainStudentFields = (
  data: PlainStudentFields,
  options: { requirePassword: boolean } = { requirePassword: true },
): void => {
  const fullName = data.fullName.trim();
  if (fullName.length < 2 || fullName.length > 100) {
    throw createAppError(
      'Full name must be between 2 and 100 characters',
      400,
    );
  }

  validateEmailFormat(data.email);

  if (!PHONE_PATTERN.test(data.phoneNumber.trim())) {
    throw createAppError('Phone number must be exactly 10 digits', 400);
  }

  const dob = new Date(data.dateOfBirth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(dob.getTime())) {
    throw createAppError('Enter a valid date of birth', 400);
  }

  if (dob >= today) {
    throw createAppError('Date of birth must be in the past', 400);
  }

  if (!GENDER_OPTIONS.includes(data.gender as (typeof GENDER_OPTIONS)[number])) {
    throw createAppError('Please select a valid gender', 400);
  }

  if (
    !COURSE_OPTIONS.includes(data.courseEnrolled as (typeof COURSE_OPTIONS)[number])
  ) {
    throw createAppError('Please select a valid course', 400);
  }

  const address = data.address.trim();
  if (address.length < 5 || address.length > 300) {
    throw createAppError('Address must be between 5 and 300 characters', 400);
  }

  if (options.requirePassword) {
    if (!data.password || data.password.trim() === '') {
      throw createAppError('Password is required', 400);
    }

    validatePasswordStrength(data.password);
  } else if (data.password && data.password.trim() !== '') {
    validatePasswordStrength(data.password);
  }
};
