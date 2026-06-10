"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const errorHandler = (err, _req, res, _next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    if (err.name === 'EncryptionError') {
        statusCode = 400;
    }
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((error) => error.message)
            .join(', ');
    }
    if (err instanceof mongoose_1.default.Error.CastError) {
        statusCode = 400;
        message = 'Invalid ID format';
    }
    if ('code' in err && err.code === 11000) {
        statusCode = 409;
        message = 'A student with this email already exists';
    }
    res.status(statusCode).json({
        success: false,
        message,
    });
};
exports.errorHandler = errorHandler;
