import { PrismaClient } from '@prisma/client';

// Mock do PrismaClient para testes
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    userProfile: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    expense: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    income: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    investmentSimulation: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    financialConcept: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    educationalInteraction: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
  })),
}));

// Mock do bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt'),
}));

// Mock do nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  })),
}));

// Mock do puppeteer
jest.mock('puppeteer', () => ({
  launch: jest.fn(() => Promise.resolve({
    newPage: jest.fn(() => Promise.resolve({
      setViewport: jest.fn(),
      setUserAgent: jest.fn(),
      setRequestInterception: jest.fn(),
      on: jest.fn(),
      setDefaultTimeout: jest.fn(),
      setDefaultNavigationTimeout: jest.fn(),
      setContent: jest.fn(),
      evaluate: jest.fn().mockResolvedValue(undefined),
      pdf: jest.fn().mockResolvedValue(Buffer.from('fake-pdf-content')),
      close: jest.fn(),
      isClosed: jest.fn().mockReturnValue(false),
    })),
    close: jest.fn(),
    isConnected: jest.fn().mockReturnValue(true),
    on: jest.fn(),
  })),
}));

// Mock do crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mocked-random-string'),
  }),
}));

// Mock do handlebars
jest.mock('handlebars', () => ({
  registerHelper: jest.fn(),
  compile: jest.fn().mockReturnValue(() => '<html>Mocked HTML</html>'),
}));

// Mock do moment
jest.mock('moment', () => {
  const moment = jest.requireActual('moment');
  return {
    ...moment,
    default: jest.fn(() => ({
      format: jest.fn().mockReturnValue('01/01/2024'),
    })),
  };
});

// Configuração global para testes
beforeAll(async () => {
  // Configurações globais antes de todos os testes
});

afterAll(async () => {
  // Limpeza após todos os testes
});

beforeEach(() => {
  // Limpar mocks antes de cada teste
  jest.clearAllMocks();
});

afterEach(() => {
  // Limpeza após cada teste
  jest.restoreAllMocks();
});

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_PORT = '465';
process.env.SMTP_SECURE = 'true';
process.env.SMTP_USER = 'test@test.com';
process.env.SMTP_PASS = 'test-password';
process.env.EMAIL_FROM = 'noreply@test.com';
process.env.EMAIL_FROM_NAME = 'Test Platform';
process.env.FRONTEND_URL = 'http://localhost:3001';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_EXECUTABLE_PATH = '/usr/bin/chromium-browser';