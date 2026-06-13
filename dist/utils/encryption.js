"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptLevel2 = exports.encryptLevel2 = exports.decryptLevel1 = exports.encryptLevel1 = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
class EncryptionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'EncryptionError';
    }
}
const getSecretKey = (envKey) => {
    const secretKey = envKey === 'CLIENT_SECRET_KEY'
        ? process.env.CLIENT_SECRET_KEY ?? process.env.BACKEND_SECRET_KEY
        : process.env.BACKEND_SECRET_KEY;
    if (!secretKey || secretKey.trim() === '') {
        throw new EncryptionError(`${envKey} is not defined in environment variables`);
    }
    return secretKey;
};
const encryptWithKey = (data, secretKey) => {
    const encrypted = crypto_js_1.default.AES.encrypt(data, secretKey).toString();
    if (!encrypted) {
        throw new EncryptionError('Encryption failed to produce ciphertext');
    }
    return encrypted;
};
const decryptWithKey = (data, secretKey) => {
    const decrypted = crypto_js_1.default.AES.decrypt(data, secretKey).toString(crypto_js_1.default.enc.Utf8);
    if (!decrypted) {
        throw new EncryptionError('Decryption failed. The data may be invalid or the secret key is incorrect');
    }
    return decrypted;
};
const encryptLevel1 = (data) => {
    try {
        if (typeof data !== 'string' || data.trim() === '') {
            throw new EncryptionError('Data to encrypt must be a non-empty string');
        }
        return encryptWithKey(data, getSecretKey('CLIENT_SECRET_KEY'));
    }
    catch (error) {
        if (error instanceof EncryptionError) {
            throw error;
        }
        throw new EncryptionError(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.encryptLevel1 = encryptLevel1;
const decryptLevel1 = (data) => {
    try {
        if (typeof data !== 'string' || data.trim() === '') {
            throw new EncryptionError('Data to decrypt must be a non-empty string');
        }
        return decryptWithKey(data, getSecretKey('CLIENT_SECRET_KEY'));
    }
    catch (error) {
        if (error instanceof EncryptionError) {
            throw error;
        }
        throw new EncryptionError(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.decryptLevel1 = decryptLevel1;
const encryptLevel2 = (data) => {
    try {
        if (typeof data !== 'string' || data.trim() === '') {
            throw new EncryptionError('Data to encrypt must be a non-empty string');
        }
        return encryptWithKey(data, getSecretKey('BACKEND_SECRET_KEY'));
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
        return decryptWithKey(data, getSecretKey('BACKEND_SECRET_KEY'));
    }
    catch (error) {
        if (error instanceof EncryptionError) {
            throw error;
        }
        throw new EncryptionError(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.decryptLevel2 = decryptLevel2;
