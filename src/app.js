const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const { StatusCodes } = require('http-status-codes');
const config = require('./config/config');
const logger = require('./utils/logger');
const securityMiddleware = require('./middlewares/security');
const { errorHandler, AppError } = require('./middlewares/error');
const certificationRoutes = require('./routes/certification.routes');

const app = express();

// Security middleware
app.use(securityMiddleware.helmet);
app.use(securityMiddleware.cors);
app.use('/api', securityMiddleware.rateLimiter);

// Request logging
if (config.env === 'development') {
    app.use(morgan('dev'));
}

// Compression
app.use(compression());

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Routes
app.use('/api', certificationRoutes);

// Handle 404
app.all('*', (req, res, next) => {
    next(new AppError(
        StatusCodes.NOT_FOUND,
        `Can't find ${req.originalUrl} on this server!`
    ));
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async () => {
    logger.info('Received shutdown signal. Closing application...');
    // Add any cleanup tasks here
    process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', error);
    process.exit(1);
});

// Unhandled rejection handler
process.on('unhandledRejection', (error) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...', error);
    process.exit(1);
});

module.exports = app; 