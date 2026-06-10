"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../utils/AppError");
const jwt_1 = require("../utils/jwt");
const authMiddleware = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next((0, AppError_1.createAppError)('Access denied. No token provided', 401));
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            next((0, AppError_1.createAppError)('Access denied. No token provided', 401));
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, (0, jwt_1.getJwtSecret)());
        req.user = decoded;
        next();
    }
    catch {
        next((0, AppError_1.createAppError)('Invalid or expired token', 401));
    }
};
exports.authMiddleware = authMiddleware;
