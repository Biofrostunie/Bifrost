// Configuração específica para testes de carga
beforeAll(async () => {
  // Configurar variáveis de ambiente para testes de carga
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-load';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db_load';
  process.env.SMTP_HOST = 'smtp.test.com';
  process.env.SMTP_PORT = '465';
  process.env.SMTP_SECURE = 'true';
  process.env.SMTP_USER = 'test@test.com';
  process.env.SMTP_PASS = 'test-password';
  process.env.EMAIL_FROM = 'noreply@test.com';
  process.env.EMAIL_FROM_NAME = 'Test Platform Load';
  process.env.FRONTEND_URL = 'http://localhost:8080';
  
  // Configurações específicas para testes de carga
  process.env.THROTTLE_TTL = '1000';
  process.env.THROTTLE_LIMIT = '1000';
});

afterAll(async () => {
  // Limpeza após testes de carga
});

// Configuração global para testes de carga
jest.setTimeout(120000);

// Configurar console para testes de carga
const originalConsoleLog = console.log;
console.log = (...args) => {
  if (args[0]?.includes('Load Test Results:')) {
    originalConsoleLog(...args);
  }
};