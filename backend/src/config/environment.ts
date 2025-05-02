import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  jwtSecret: string;
  jwtExpiration: string;
  jwtRefreshExpiration: string;
  databaseUrl: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
}

// Default values
const defaultConfig: EnvironmentConfig = {
  nodeEnv: 'development',
  port: 3000,
  jwtSecret: 'default_jwt_secret_for_development_only',
  jwtExpiration: '1d',
  jwtRefreshExpiration: '7d',
  databaseUrl: 'postgresql://postgres:postgres@localhost:5432/bifrost?schema=public',
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100,
};

// Create and validate config from environment variables
const envConfig: EnvironmentConfig = {
  nodeEnv: process.env.NODE_ENV || defaultConfig.nodeEnv,
  port: parseInt(process.env.PORT || defaultConfig.port.toString(), 10),
  jwtSecret: process.env.JWT_SECRET || defaultConfig.jwtSecret,
  jwtExpiration: process.env.JWT_EXPIRATION || defaultConfig.jwtExpiration,
  jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || defaultConfig.jwtRefreshExpiration,
  databaseUrl: process.env.DATABASE_URL || defaultConfig.databaseUrl,
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || defaultConfig.rateLimitWindowMs.toString(), 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || defaultConfig.rateLimitMax.toString(), 10),
};

// Log warnings for missing environment variables in production
if (envConfig.nodeEnv === 'production') {
  if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not set in production environment!');
  }
  if (!process.env.DATABASE_URL) {
    console.warn('WARNING: DATABASE_URL is not set in production environment!');
  }
}

export default envConfig;