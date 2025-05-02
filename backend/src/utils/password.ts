import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare a password with a hash
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate a random token for password reset
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};