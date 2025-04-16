import { StatusCodes } from 'http-status-codes';

export interface ErrorWithStatus extends Error {
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

    static badRequest(message: string): AppError {
        return new AppError(StatusCodes.BAD_REQUEST, message);
    }

    static unauthorized(message: string): AppError {
        return new AppError(StatusCodes.UNAUTHORIZED, message);
    }

    static forbidden(message: string): AppError {
        return new AppError(StatusCodes.FORBIDDEN, message);
    }

    static notFound(message: string): AppError {
        return new AppError(StatusCodes.NOT_FOUND, message);
    }

    static internal(message: string): AppError {
        return new AppError(StatusCodes.INTERNAL_SERVER_ERROR, message);
    }
} 