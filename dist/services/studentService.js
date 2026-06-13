"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudent = exports.updateStudent = exports.getStudents = exports.registerStudent = exports.validateEncryptedUpdatePayload = exports.validateEncryptedPayload = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const Student_1 = require("../models/Student");
const encryption_1 = require("../utils/encryption");
const AppError_1 = require("../utils/AppError");
const emailLookup_1 = require("../utils/emailLookup");
const validation_1 = require("../utils/validation");
const auth_types_1 = require("../types/auth.types");
const student_types_1 = require("../types/student.types");
const ENCRYPTED_STUDENT_UPDATE_FIELDS = student_types_1.ENCRYPTED_STUDENT_FIELDS.filter((field) => field !== 'password');
const toPlainStudentFields = (data) => ({
    fullName: (0, encryption_1.decryptLevel1)(data.fullName),
    email: (0, encryption_1.decryptLevel1)(data.email),
    phoneNumber: (0, encryption_1.decryptLevel1)(data.phoneNumber),
    dateOfBirth: (0, encryption_1.decryptLevel1)(data.dateOfBirth),
    gender: (0, encryption_1.decryptLevel1)(data.gender),
    address: (0, encryption_1.decryptLevel1)(data.address),
    courseEnrolled: (0, encryption_1.decryptLevel1)(data.courseEnrolled),
    password: (0, encryption_1.decryptLevel1)(data.password),
});
const toPlainUpdateFields = (data) => ({
    fullName: (0, encryption_1.decryptLevel1)(data.fullName),
    email: (0, encryption_1.decryptLevel1)(data.email),
    phoneNumber: (0, encryption_1.decryptLevel1)(data.phoneNumber),
    dateOfBirth: (0, encryption_1.decryptLevel1)(data.dateOfBirth),
    gender: (0, encryption_1.decryptLevel1)(data.gender),
    address: (0, encryption_1.decryptLevel1)(data.address),
    courseEnrolled: (0, encryption_1.decryptLevel1)(data.courseEnrolled),
    password: typeof data.password === 'string' && data.password.trim() !== ''
        ? (0, encryption_1.decryptLevel1)(data.password)
        : undefined,
});
const encryptFields = async (data) => {
    const encrypted = {};
    for (const field of student_types_1.ENCRYPTED_STUDENT_FIELDS) {
        const plainValue = (0, encryption_1.decryptLevel1)(data[field]);
        if (field === 'password') {
            const hashedPassword = await bcrypt_1.default.hash(plainValue, auth_types_1.BCRYPT_SALT_ROUNDS);
            encrypted[field] = (0, encryption_1.encryptLevel2)(hashedPassword);
        }
        else {
            encrypted[field] = (0, encryption_1.encryptLevel2)(plainValue);
        }
    }
    return encrypted;
};
const encryptFieldsForUpdate = async (data, existingStudent) => {
    const encrypted = {};
    for (const field of ENCRYPTED_STUDENT_UPDATE_FIELDS) {
        const plainValue = (0, encryption_1.decryptLevel1)(data[field]);
        encrypted[field] = (0, encryption_1.encryptLevel2)(plainValue);
    }
    if (typeof data.password === 'string' && data.password.trim() !== '') {
        const plainPassword = (0, encryption_1.decryptLevel1)(data.password);
        const hashedPassword = await bcrypt_1.default.hash(plainPassword, auth_types_1.BCRYPT_SALT_ROUNDS);
        encrypted.password = (0, encryption_1.encryptLevel2)(hashedPassword);
    }
    else {
        encrypted.password = existingStudent.password;
    }
    return encrypted;
};
const decryptFields = (student) => {
    const decrypted = {};
    decrypted._id = student._id.toString();
    decrypted.createdAt = student.createdAt.toISOString();
    decrypted.updatedAt = student.updatedAt.toISOString();
    for (const field of student_types_1.ENCRYPTED_STUDENT_FIELDS) {
        const plainValue = (0, encryption_1.decryptLevel2)(student[field]);
        if (field === 'password') {
            decrypted[field] = (0, encryption_1.encryptLevel1)('redacted');
            continue;
        }
        decrypted[field] = (0, encryption_1.encryptLevel1)(plainValue);
    }
    return decrypted;
};
const validateEncryptedPayload = (data) => {
    const missingFields = student_types_1.ENCRYPTED_STUDENT_FIELDS.filter((field) => typeof data[field] !== 'string' || data[field].trim() === '');
    if (missingFields.length > 0) {
        throw (0, AppError_1.createAppError)(`Missing or invalid fields: ${missingFields.join(', ')}`, 400);
    }
    const payload = data;
    try {
        (0, validation_1.validatePlainStudentFields)(toPlainStudentFields(payload), {
            requirePassword: true,
        });
    }
    catch (error) {
        if (error instanceof Error && error.name === 'EncryptionError') {
            throw (0, AppError_1.createAppError)('Invalid encrypted field data', 400);
        }
        throw error;
    }
    return payload;
};
exports.validateEncryptedPayload = validateEncryptedPayload;
const validateEncryptedUpdatePayload = (data) => {
    const missingFields = ENCRYPTED_STUDENT_UPDATE_FIELDS.filter((field) => typeof data[field] !== 'string' || data[field].trim() === '');
    if (missingFields.length > 0) {
        throw (0, AppError_1.createAppError)(`Missing or invalid fields: ${missingFields.join(', ')}`, 400);
    }
    const payload = data;
    try {
        (0, validation_1.validatePlainStudentFields)(toPlainUpdateFields(payload), {
            requirePassword: false,
        });
    }
    catch (error) {
        if (error instanceof Error && error.name === 'EncryptionError') {
            throw (0, AppError_1.createAppError)('Invalid encrypted field data', 400);
        }
        throw error;
    }
    return payload;
};
exports.validateEncryptedUpdatePayload = validateEncryptedUpdatePayload;
const validateObjectId = (id) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw (0, AppError_1.createAppError)('Invalid student ID', 400);
    }
};
const registerStudent = async (payload) => {
    const plainEmail = await (0, emailLookup_1.assertEmailAvailable)(payload.email);
    const encryptedData = await encryptFields(payload);
    const student = await Student_1.Student.create({
        ...encryptedData,
        emailLookup: (0, emailLookup_1.createEmailLookup)(plainEmail),
    });
    return decryptFields(student);
};
exports.registerStudent = registerStudent;
const getStudents = async () => {
    const students = await Student_1.Student.find().sort({ createdAt: -1 });
    return students.map(decryptFields);
};
exports.getStudents = getStudents;
const updateStudent = async (id, payload) => {
    validateObjectId(id);
    const existingStudent = await Student_1.Student.findById(id);
    if (!existingStudent) {
        throw (0, AppError_1.createAppError)('Student not found', 404);
    }
    const plainEmail = await (0, emailLookup_1.assertEmailAvailable)(payload.email, id);
    const encryptedData = await encryptFieldsForUpdate(payload, existingStudent);
    const student = await Student_1.Student.findByIdAndUpdate(id, {
        ...encryptedData,
        emailLookup: (0, emailLookup_1.createEmailLookup)(plainEmail),
    }, {
        new: true,
        runValidators: true,
    });
    if (!student) {
        throw (0, AppError_1.createAppError)('Student not found', 404);
    }
    return decryptFields(student);
};
exports.updateStudent = updateStudent;
const deleteStudent = async (id) => {
    validateObjectId(id);
    const student = await Student_1.Student.findByIdAndDelete(id);
    if (!student) {
        throw (0, AppError_1.createAppError)('Student not found', 404);
    }
};
exports.deleteStudent = deleteStudent;
