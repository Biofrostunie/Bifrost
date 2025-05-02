import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types';
import envConfig from '../config/environment';

// Convert time strings to seconds
const parseTimeToSeconds = (time: string): number => {
  const unit = time.slice(-1);
  const value = parseInt(time.slice(0, -1));
  
  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60;
    case 'h':
      return value * 60 * 60;
    case 'm':
      return value * 60;
    case 's':
      return value;
    default:
      return parseInt(time); // Assume seconds if no unit
  }
};

/**
 * Generate a JWT token
 */
export const generateToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, envConfig.jwtSecret, {
    expiresIn: parseTimeToSeconds(envConfig.jwtExpiration),
  });
};

/**
 * Generate a refresh token
 */
export const generateRefreshToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, envConfig.jwtSecret, {
    expiresIn: parseTimeToSeconds(envConfig.jwtRefreshExpiration),
  });
};

/**
 * Verify a JWT token
 */
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, envConfig.jwtSecret) as TokenPayload;
};