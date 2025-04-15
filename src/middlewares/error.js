const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');

class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        logger.error({
            message: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method
        });

        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Production error response
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        } else {
            // Programming or unknown errors: don't leak error details
            logger.error({
                message: err.message,
                stack: err.stack,
                path: req.path,
                method: req.method
            });

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: 'error',
                message: 'Something went wrong!'
            });
        }
    }
};

module.exports = {
    AppError,
    errorHandler
}; 