import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '@/shared/exceptions';
import { StatusCodes } from 'http-status-codes';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

interface JwtPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Authentication required');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Authentication token missing');
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      req.user = decoded;
      next();
    } catch (error) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
}; 