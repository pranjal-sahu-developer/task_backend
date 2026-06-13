"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePlainStudentFields = exports.validatePasswordStrength = exports.validateEmailFormat = exports.COURSE_OPTIONS = exports.GENDER_OPTIONS = exports.MIN_PASSWORD_LENGTH = exports.PHONE_PATTERN = exports.PASSWORD_PATTERN = exports.EMAIL_PATTERN = void 0;
const AppError_1 = require("./AppError");
exports.EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
exports.PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
exports.PHONE_PATTERN = /^\+91\d{10}$/;
exports.MIN_PASSWORD_LENGTH = 8;
exports.GENDER_OPTIONS = ['Male', 'Female', 'Other'];
exports.COURSE_OPTIONS = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical Engineering',
    'Business Administration',
    'Data Science',
];
const validateEmailFormat = (email) => {
    if (!exports.EMAIL_PATTERN.test(email.trim())) {
        throw (0, AppError_1.createAppError)('Enter a valid email address', 400);
    }
};
exports.validateEmailFormat = validateEmailFormat;
const validatePasswordStrength = (password) => {
    if (password.length < exports.MIN_PASSWORD_LENGTH) {
        throw (0, AppError_1.createAppError)('Password must be at least 8 characters', 400);
    }
    if (!exports.PASSWORD_PATTERN.test(password)) {
        throw (0, AppError_1.createAppError)('Password must include uppercase, lowercase, and a number', 400);
    }
};
exports.validatePasswordStrength = validatePasswordStrength;
const validatePlainStudentFields = (data, options = { requirePassword: true }) => {
    const fullName = data.fullName.trim();
    if (fullName.length < 2 || fullName.length > 100) {
        throw (0, AppError_1.createAppError)('Full name must be between 2 and 100 characters', 400);
    }
    (0, exports.validateEmailFormat)(data.email);
    if (!exports.PHONE_PATTERN.test(data.phoneNumber.trim())) {
        throw (0, AppError_1.createAppError)('Phone number must be exactly 10 digits', 400);
    }
    const dob = new Date(data.dateOfBirth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(dob.getTime())) {
        throw (0, AppError_1.createAppError)('Enter a valid date of birth', 400);
    }
    if (dob >= today) {
        throw (0, AppError_1.createAppError)('Date of birth must be in the past', 400);
    }
    if (!exports.GENDER_OPTIONS.includes(data.gender)) {
        throw (0, AppError_1.createAppError)('Please select a valid gender', 400);
    }
    if (!exports.COURSE_OPTIONS.includes(data.courseEnrolled)) {
        throw (0, AppError_1.createAppError)('Please select a valid course', 400);
    }
    const address = data.address.trim();
    if (address.length < 5 || address.length > 300) {
        throw (0, AppError_1.createAppError)('Address must be between 5 and 300 characters', 400);
    }
    if (options.requirePassword) {
        if (!data.password || data.password.trim() === '') {
            throw (0, AppError_1.createAppError)('Password is required', 400);
        }
        (0, exports.validatePasswordStrength)(data.password);
    }
    else if (data.password && data.password.trim() !== '') {
        (0, exports.validatePasswordStrength)(data.password);
    }
};
exports.validatePlainStudentFields = validatePlainStudentFields;
