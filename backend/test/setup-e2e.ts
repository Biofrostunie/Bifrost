import { PrismaClient } from '@prisma/client';

// Configuração específica para testes E2E
beforeAll(async () => {
  // Configurar variáveis de ambiente para E2E
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-e2e';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db_e2e';
  process.env.SMTP_HOST = 'smtp.test.com';
  process.env.SMTP_PORT = '465';
  process.env.SMTP_SECURE = 'true';
  process.env.SMTP_USER = 'test@test.com';
  process.env.SMTP_PASS = 'test-password';
  process.env.EMAIL_FROM = 'noreply@test.com';
  process.env.EMAIL_FROM_NAME = 'Test Platform E2E';
  process.env.FRONTEND_URL = 'http://localhost:3001';
});

afterAll(async () => {
  // Limpeza após todos os testes E2E
});

// Configuração global para testes E2E
jest.setTimeout(60000);