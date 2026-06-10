"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudent = exports.updateStudent = exports.getStudents = exports.registerStudent = exports.validateEncryptedPayload = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const Student_1 = require("../models/Student");
const encryption_1 = require("../utils/encryption");
const AppError_1 = require("../utils/AppError");
const auth_types_1 = require("../types/auth.types");
const student_types_1 = require("../types/student.types");
const encryptFields = async (data) => {
    const encrypted = {};
    for (const field of student_types_1.ENCRYPTED_STUDENT_FIELDS) {
        if (field === 'password') {
            const hashedPassword = await bcrypt_1.default.hash(data.password, auth_types_1.BCRYPT_SALT_ROUNDS);
            encrypted[field] = (0, encryption_1.encryptLevel2)(hashedPassword);
        }
        else {
            encrypted[field] = (0, encryption_1.encryptLevel2)(data[field]);
        }
    }
    return encrypted;
};
const decryptFields = (student) => {
    const decrypted = {};
    decrypted._id = student._id.toString();
    decrypted.createdAt = student.createdAt.toISOString();
    decrypted.updatedAt = student.updatedAt.toISOString();
    for (const field of student_types_1.ENCRYPTED_STUDENT_FIELDS) {
        decrypted[field] = (0, encryption_1.decryptLevel2)(student[field]);
    }
    return decrypted;
};
const validateEncryptedPayload = (data) => {
    const missingFields = student_types_1.ENCRYPTED_STUDENT_FIELDS.filter((field) => typeof data[field] !== 'string' || data[field].trim() === '');
    if (missingFields.length > 0) {
        throw (0, AppError_1.createAppError)(`Missing or invalid fields: ${missingFields.join(', ')}`, 400);
    }
    return data;
};
exports.validateEncryptedPayload = validateEncryptedPayload;
const validateObjectId = (id) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw (0, AppError_1.createAppError)('Invalid student ID', 400);
    }
};
const registerStudent = async (payload) => {
    const encryptedData = await encryptFields(payload);
    const student = await Student_1.Student.create(encryptedData);
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
    const encryptedData = await encryptFields(payload);
    const student = await Student_1.Student.findByIdAndUpdate(id, encryptedData, {
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
