import { Request, Response } from 'express';

export interface TrpcContext {
  req: Request;
  res: Response;
  user?: {
    id: string;
    email: string;
  };
}

export const createContext = ({ req, res }: { req: Request; res: Response }): TrpcContext => {
  return {
    req,
    res,
    user: (req as any).user,
  };
};