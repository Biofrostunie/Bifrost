import { initTRPC, TRPCError } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types';
import envConfig from './environment';

// Create context for tRPC
export const createContext = ({ req, res }: CreateExpressContextOptions) => {
  const getUser = () => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, envConfig.jwtSecret) as TokenPayload;
        return {
          userId: decoded.userId,
          email: decoded.email,
        };
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  return {
    req,
    res,
    user: getUser(),
  };
};

// tRPC initialization
const t = initTRPC.context<typeof createContext>().create();

// Base router and procedure
export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware for protected routes
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(isAuthed);