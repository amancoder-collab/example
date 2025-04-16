import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from './response.types';

export class ResponseHandler {
    public static success<T>(
        res: Response,
        data?: T,
        message = 'Success',
        meta?: { [key: string]: unknown }
    ): Response {
        const response: ApiResponse<T> = {
            statusCode: res.statusCode || StatusCodes.OK,
            message,
            data,
            meta
        };
        return res.json(response);
    }

    public static error(
        res: Response,
        message = 'Internal Server Error',
        statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    ): Response {
        const response: ApiResponse<null> = {
            statusCode,
            message
        };
        return res.status(statusCode).json(response);
    }
} 