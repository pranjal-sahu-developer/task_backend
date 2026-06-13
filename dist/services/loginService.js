"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.validateLoginPayload = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const encryption_1 = require("../utils/encryption");
const emailLookup_1 = require("../utils/emailLookup");
const AppError_1 = require("../utils/AppError");
const jwt_1 = require("../utils/jwt");
const validation_1 = require("../utils/validation");
const validateLoginPayload = (data) => {
    const missingFields = [];
    if (typeof data.email !== 'string' || data.email.trim() === '') {
        missingFields.push('email');
    }
    if (typeof data.password !== 'string' || data.password.trim() === '') {
        missingFields.push('password');
    }
    if (missingFields.length > 0) {
        throw (0, AppError_1.createAppError)(`Missing or invalid fields: ${missingFields.join(', ')}`, 400);
    }
    return {
        email: data.email.trim(),
        password: data.password.trim(),
    };
};
exports.validateLoginPayload = validateLoginPayload;
const loginUser = async (payload) => {
    const student = await (0, emailLookup_1.findStudentForLogin)(payload.email);
    if (!student) {
        throw (0, AppError_1.createAppError)('Invalid email or password', 401);
    }
    let loginPassword;
    try {
        loginPassword = (0, encryption_1.decryptLevel1)(payload.password);
        (0, validation_1.validatePasswordStrength)(loginPassword);
    }
    catch (error) {
        if (error instanceof Error &&
            'statusCode' in error &&
            error.statusCode === 400) {
            throw (0, AppError_1.createAppError)('Invalid email or password', 401);
        }
        throw (0, AppError_1.createAppError)('Invalid email or password', 401);
    }
    const storedPasswordHash = (0, encryption_1.decryptLevel2)(student.password);
    const isPasswordValid = await bcrypt_1.default.compare(loginPassword, storedPasswordHash);
    if (!isPasswordValid) {
        throw (0, AppError_1.createAppError)('Invalid email or password', 401);
    }
    const decryptedEmail = (0, encryption_1.decryptLevel2)(student.email);
    const token = jsonwebtoken_1.default.sign({
        id: student._id.toString(),
        email: decryptedEmail,
    }, (0, jwt_1.getJwtSecret)(), { expiresIn: '7d' });
    return { token };
};
exports.loginUser = loginUser;
