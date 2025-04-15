const logger = require('../logger/logger.service');

class ProcessHandler {
    constructor() {
        this.cleanupHandlers = new Set();
    }

    addCleanupHandler(handler) {
        this.cleanupHandlers.add(handler);
    }

    async executeCleanup() {
        logger.info('Executing cleanup handlers...');
        for (const handler of this.cleanupHandlers) {
            try {
                await handler();
            } catch (error) {
                logger.error('Cleanup handler failed:', error);
            }
        }
    }

    setupProcessHandlers() {
        // Graceful shutdown
        const gracefulShutdown = async () => {
            logger.info('Received shutdown signal. Starting cleanup...');
            await this.executeCleanup();
            process.exit(0);
        };

        // Uncaught exception handler
        process.on('uncaughtException', async (error) => {
            logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', error);
            await this.executeCleanup();
            process.exit(1);
        });

        // Unhandled rejection handler
        process.on('unhandledRejection', async (error) => {
            logger.error('UNHANDLED REJECTION! 💥 Shutting down...', error);
            await this.executeCleanup();
            process.exit(1);
        });

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
    }
}

module.exports = new ProcessHandler();