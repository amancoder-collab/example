import express, { Application, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import compression from 'compression';
import { StatusCodes } from 'http-status-codes';
import config from '@/config';
import security from '@/infrastructure/security/security.service';
import { errorHandler, AppError } from '@/middleware/error.middleware';
import processHandler from './process-handler';
import { logger } from '../logger/logger.service';
import { Server } from 'http';

class ExpressServer {
    private app: Application;

    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
        processHandler.setupProcessHandlers();
    }

    private setupMiddleware(): void {
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

    private setupRoutes(): void {
        // Health check
        this.app.get('/health', (_req: Request, res: Response) => {
            res.status(200).json({ status: 'ok' });
        });

        // API routes
        // this.app.use('/api', routes);

        // Handle 404
        this.app.all('*', (req: Request, _res: Response, next: NextFunction) => {
            next(new AppError(
                StatusCodes.NOT_FOUND,
                `Can't find ${req.originalUrl} on this server!`
            ));
        });
    }

    private setupErrorHandling(): void {
        this.app.use(errorHandler);
    }

    public start(): Server {
        return this.app.listen(config.port, () => {
            logger.info(`Server running in ${config.env} mode on port ${config.port}`);
        });
    }

    public getApp(): Application {
        return this.app;
    }
}

export default new ExpressServer(); 