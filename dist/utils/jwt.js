"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwtSecret = void 0;
const AppError_1 = require("./AppError");
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.trim() === '') {
        throw (0, AppError_1.createAppError)('JWT_SECRET is not defined in environment variables', 500);
    }
    return secret;
};
exports.getJwtSecret = getJwtSecret;
