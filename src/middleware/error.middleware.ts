import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { logger } from '@/infrastructure/logger/logger.service';

interface ErrorWithStatus extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
}

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly status: string;
    public readonly isOperational: boolean;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: AppError | Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const error = err as ErrorWithStatus;
    error.statusCode = (err as AppError).statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    error.status = error.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        logger.error('Error 💥', {
            status: error.status,
            error: error,
            message: error.message,
            stack: error.stack
        });

        res.status((error as AppError).statusCode).json({
            status: error.status,
            error: error,
            message: error.message,
            stack: error.stack
        });
    } else {
        // Production mode
        logger.error('Error 💥', { error: error });

        // Operational, trusted error: send message to client
        if ((error as AppError).isOperational) {
            res.status((error as AppError).statusCode).json({
                status: error.status,
                message: error.message
            });
        } else {
            // Programming or other unknown error: don't leak error details
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: 'error',
                message: 'Something went wrong!'
            });
        }
    }
}; 