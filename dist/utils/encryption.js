"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptLevel2 = exports.encryptLevel2 = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
class EncryptionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'EncryptionError';
    }
}
const getSecretKey = () => {
    const secretKey = process.env.BACKEND_SECRET_KEY;
    if (!secretKey || secretKey.trim() === '') {
        throw new EncryptionError('BACKEND_SECRET_KEY is not defined in environment variables');
    }
    return secretKey;
};
const encryptLevel2 = (data) => {
    try {
        if (typeof data !== 'string' || data.trim() === '') {
            throw new EncryptionError('Data to encrypt must be a non-empty string');
        }
        const secretKey = getSecretKey();
        const encrypted = crypto_js_1.default.AES.encrypt(data, secretKey).toString();
        if (!encrypted) {
            throw new EncryptionError('Encryption failed to produce ciphertext');
        }
        return encrypted;
    }
    catch (error) {
        if (error instanceof EncryptionError) {
            throw error;
        }
        throw new EncryptionError(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.encryptLevel2 = encryptLevel2;
const decryptLevel2 = (data) => {
    try {
        if (typeof data !== 'string' || data.trim() === '') {
            throw new EncryptionError('Data to decrypt must be a non-empty string');
        }
        const secretKey = getSecretKey();
        const decrypted = crypto_js_1.default.AES.decrypt(data, secretKey).toString(crypto_js_1.default.enc.Utf8);
        if (!decrypted) {
            throw new EncryptionError('Decryption failed. The data may be invalid or the secret key is incorrect');
        }
        return decrypted;
    }
    catch (error) {
        if (error instanceof EncryptionError) {
            throw error;
        }
        throw new EncryptionError(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.decryptLevel2 = decryptLevel2;
