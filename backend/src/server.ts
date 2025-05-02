import app from './app';
import envConfig from './config/environment';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma
const prisma = new PrismaClient();

// Start the server
const server = app.listen(envConfig.port, () => {
  console.log(`[Server] Starting Bifrost API in ${envConfig.nodeEnv} mode`);
  console.log(`[Server] Listening on port ${envConfig.port}`);
  console.log(`[Server] API Documentation: http://localhost:${envConfig.port}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[Error] Unhandled Rejection:', err);
  // Close server and exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM signal received: closing HTTP server');
  
  // Close database connection
  prisma.$disconnect().then(() => {
    console.log('[Database] Disconnected');
    
    // Close server
    server.close(() => {
      console.log('[Server] HTTP server closed');
      process.exit(0);
    });
  });
});