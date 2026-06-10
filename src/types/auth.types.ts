export interface LoginPayload {
  email: string;
  password: string;
}

export interface JwtPayload {
  id: string;
  email: string;
}

export const BCRYPT_SALT_ROUNDS = 10;
