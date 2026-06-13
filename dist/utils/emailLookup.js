"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertEmailAvailable = exports.findStudentForLogin = exports.findStudentByPlainEmail = exports.createEmailLookup = exports.normalizeEmailForLookup = exports.trimEmail = void 0;
const crypto_1 = __importDefault(require("crypto"));
const Student_1 = require("../models/Student");
const encryption_1 = require("./encryption");
const AppError_1 = require("./AppError");
const trimEmail = (email) => email.trim();
exports.trimEmail = trimEmail;
const normalizeEmailForLookup = (email) => email.trim().toLowerCase();
exports.normalizeEmailForLookup = normalizeEmailForLookup;
const createEmailLookup = (plainEmail) => crypto_1.default
    .createHash('sha256')
    .update((0, exports.normalizeEmailForLookup)(plainEmail))
    .digest('hex');
exports.createEmailLookup = createEmailLookup;
const findStudentByPlainEmail = async (plainEmail) => {
    const normalized = (0, exports.normalizeEmailForLookup)(plainEmail);
    const emailLookup = (0, exports.createEmailLookup)(normalized);
    const byLookup = await Student_1.Student.findOne({ emailLookup });
    if (byLookup) {
        return byLookup;
    }
    const students = await Student_1.Student.find();
    for (const student of students) {
        try {
            const storedEmail = (0, exports.normalizeEmailForLookup)((0, encryption_1.decryptLevel2)(student.email));
            if (storedEmail === normalized) {
                return student;
            }
        }
        catch {
            continue;
        }
    }
    return null;
};
exports.findStudentByPlainEmail = findStudentByPlainEmail;
const findStudentForLogin = async (clientEncryptedEmail) => {
    let loginEmail;
    try {
        loginEmail = (0, exports.trimEmail)((0, encryption_1.decryptLevel1)(clientEncryptedEmail));
    }
    catch {
        return null;
    }
    const students = await Student_1.Student.find();
    for (const student of students) {
        try {
            const storedEmail = (0, exports.trimEmail)((0, encryption_1.decryptLevel2)(student.email));
            if (storedEmail === loginEmail) {
                return student;
            }
        }
        catch {
            continue;
        }
    }
    return null;
};
exports.findStudentForLogin = findStudentForLogin;
const assertEmailAvailable = async (clientEncryptedEmail, excludeStudentId) => {
    let plainEmail;
    try {
        plainEmail = (0, exports.trimEmail)((0, encryption_1.decryptLevel1)(clientEncryptedEmail));
    }
    catch {
        throw (0, AppError_1.createAppError)('Invalid email', 400);
    }
    const existingStudent = await (0, exports.findStudentByPlainEmail)(plainEmail);
    if (existingStudent &&
        (!excludeStudentId || existingStudent._id.toString() !== excludeStudentId)) {
        throw (0, AppError_1.createAppError)('A student with this email already exists', 409);
    }
    return plainEmail;
};
exports.assertEmailAvailable = assertEmailAvailable;
