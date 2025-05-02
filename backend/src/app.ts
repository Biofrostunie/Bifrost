import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import swaggerUi from 'swagger-ui-express';

import { notFoundHandler, errorHandler } from './middlewares/error.middleware';
import apiRoutes from './routes';
import { swaggerSpec } from './config/swagger';
import { createContext } from './config/trpc';
import { appRouter } from './trpc';
import envConfig from './config/environment';

// Create Express app
const app: Express = express();

// Apply global middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(envConfig.nodeEnv === 'development' ? 'dev' : 'combined'));

// Apply rate limiting
const limiter = rateLimit({
  windowMs: envConfig.rateLimitWindowMs,
  max: envConfig.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/v1', apiRoutes);

// tRPC Router
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Bifrost API is running',
    timestamp: new Date().toISOString(),
    environment: envConfig.nodeEnv,
  });
});

// Error handling middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;