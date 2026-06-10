import CryptoJS from 'crypto-js';

class EncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EncryptionError';
  }
}

const getSecretKey = (): string => {
  const secretKey = process.env.BACKEND_SECRET_KEY;

  if (!secretKey || secretKey.trim() === '') {
    throw new EncryptionError(
      'BACKEND_SECRET_KEY is not defined in environment variables',
    );
  }

  return secretKey;
};

export const encryptLevel2 = (data: string): string => {
  try {
    if (typeof data !== 'string' || data.trim() === '') {
      throw new EncryptionError('Data to encrypt must be a non-empty string');
    }

    const secretKey = getSecretKey();
    const encrypted = CryptoJS.AES.encrypt(data, secretKey).toString();

    if (!encrypted) {
      throw new EncryptionError('Encryption failed to produce ciphertext');
    }

    return encrypted;
  } catch (error) {
    if (error instanceof EncryptionError) {
      throw error;
    }

    throw new EncryptionError(
      `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};

export const decryptLevel2 = (data: string): string => {
  try {
    if (typeof data !== 'string' || data.trim() === '') {
      throw new EncryptionError('Data to decrypt must be a non-empty string');
    }

    const secretKey = getSecretKey();
    const decrypted = CryptoJS.AES.decrypt(data, secretKey).toString(
      CryptoJS.enc.Utf8,
    );

    if (!decrypted) {
      throw new EncryptionError(
        'Decryption failed. The data may be invalid or the secret key is incorrect',
      );
    }

    return decrypted;
  } catch (error) {
    if (error instanceof EncryptionError) {
      throw error;
    }

    throw new EncryptionError(
      `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};
