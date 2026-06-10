"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppError = void 0;
const createAppError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};
exports.createAppError = createAppError;
