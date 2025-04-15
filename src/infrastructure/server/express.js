const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const { StatusCodes } = require('http-status-codes');

const config = require('../../shared/config');
const logger = require('../logger/logger.service');
const security = require('../security/security.service');
const { errorHandler, AppError } = require('../../shared/middleware/error.middleware');
const routes = require('../../features/certification-lookup/routes');
const processHandler = require('./process-handler');

class ExpressServer {
    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
        processHandler.setupProcessHandlers();
    }

    setupMiddleware() {
        const securityMiddleware = security.getMiddleware();
        
        // Security middleware
        this.app.use(securityMiddleware.helmet);
        this.app.use(securityMiddleware.cors);
        this.app.use('/api', securityMiddleware.rateLimiter);

        // Request logging
        if (config.env === 'development') {
            this.app.use(morgan('dev'));
        }

        // Compression
        this.app.use(compression());

        // Body parser
        this.app.use(express.json({ limit: '10kb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10kb' }));
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.status(200).json({ status: 'ok' });
        });

        // API routes
        this.app.use('/api', routes);

        // Handle 404
        this.app.all('*', (req, res, next) => {
            next(new AppError(
                StatusCodes.NOT_FOUND,
                `Can't find ${req.originalUrl} on this server!`
            ));
        });
    }

    setupErrorHandling() {
        this.app.use(errorHandler);
    }

    start() {
        return this.app.listen(config.port, () => {
            logger.info(`Server running in ${config.env} mode on port ${config.port}`);
        });
    }

    getApp() {
        return this.app;
    }
}

module.exports = new ExpressServer(); 