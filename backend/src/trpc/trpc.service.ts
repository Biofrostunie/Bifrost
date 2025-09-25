import { INestApplication, Injectable, Logger } from '@nestjs/common';
import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export interface Context {
  req: Request;
  res: Response;
}

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof z.ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

@Injectable()
export class TrpcService {
  private readonly logger = new Logger(TrpcService.name);
  
  trpc = t;
  procedure = publicProcedure;
  router = router;
  middleware = middleware;

  applyMiddleware(router: any, app: INestApplication) {
    this.logger.log('Setting up tRPC middleware...');
    
    const adapter = trpcExpress.createExpressMiddleware({
      router,
      createContext: ({ req, res }: trpcExpress.CreateExpressContextOptions): Context => ({
        req,
        res,
      }),
      onError: ({ error, type, path, input, ctx, req }) => {
        this.logger.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
        if (error.code === 'INTERNAL_SERVER_ERROR') {
          this.logger.error('Internal error details:', error);
        }
      },
    });

    // Apply tRPC middleware to handle all /trpc routes with proper typing
    app.use('/trpc', (req: Request, res: Response, next: NextFunction) => {
      // Log tRPC requests for debugging
      this.logger.debug(`tRPC request: ${req.method} ${req.url}`);
      adapter(req, res, next);
    });
    
    this.logger.log('✅ tRPC middleware configured successfully');
  }
}