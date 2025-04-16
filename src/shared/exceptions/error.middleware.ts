import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { logger } from '@/infrastructure/logger/logger.service';
import { ErrorWithStatus, AppError } from './app.error';

export const errorHandler = (
    err: AppError | Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const error = err as ErrorWithStatus;
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

    if (process.env.NODE_ENV === 'development') {
        logger.error('Error 💥', {
            status: error.status,
            error: error,
            message: error.message,
            stack: error.stack
        });

        res.error(error.message, statusCode);
    } else {
        // Production mode
        logger.error('Error 💥', { error });

        // Operational, trusted error: send message to client
        if (error.isOperational) {
            res.error(error.message, statusCode);
        } else {
            // Programming or other unknown error: don't leak error details
            res.error('Something went wrong!', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}; 