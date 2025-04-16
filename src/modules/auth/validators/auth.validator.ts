import { Request, Response, NextFunction } from 'express';
import {
  loginDtoSchema,
  registerDtoSchema,
  updateProfileDtoSchema
} from '../dto/auth.dto';
import { AppError } from '@/shared/exceptions';
import { StatusCodes } from 'http-status-codes';

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  try {
    loginDtoSchema.parse(req.body);
    next();
  } catch (error: any) {
    next(new AppError(StatusCodes.BAD_REQUEST, error.errors?.[0]?.message || 'Validation failed'));
  }
};

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  try {
    registerDtoSchema.parse(req.body);
    next();
  } catch (error: any) {
    next(new AppError(StatusCodes.BAD_REQUEST, error.errors?.[0]?.message || 'Validation failed'));
  }
};

export const validateUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
  try {
    updateProfileDtoSchema.parse(req.body);
    next();
  } catch (error: any) {
    next(new AppError(StatusCodes.BAD_REQUEST, error.errors?.[0]?.message || 'Validation failed'));
  }
}; 