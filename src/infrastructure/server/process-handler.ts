import { logger } from '@/infrastructure/logger/logger.service';

type CleanupHandler = () => Promise<void>;

class ProcessHandler {
    private cleanupHandlers: Set<CleanupHandler>;

    constructor() {
        this.cleanupHandlers = new Set();
    }

    public addCleanupHandler(handler: CleanupHandler): void {
        this.cleanupHandlers.add(handler);
    }

    private async executeCleanup(): Promise<void> {
        logger.info('Executing cleanup handlers...');
        for (const handler of this.cleanupHandlers) {
            try {
                await handler();
            } catch (error) {
                logger.error('Cleanup handler failed:', { error });
            }
        }
    }

    public setupProcessHandlers(): void {
        // Graceful shutdown
        const gracefulShutdown = async (): Promise<void> => {
            logger.info('Received shutdown signal. Starting cleanup...');
            await this.executeCleanup();
            process.exit(0);
        };

        // Uncaught exception handler
        process.on('uncaughtException', async (error: Error) => {
            logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', { error });
            await this.executeCleanup();
            process.exit(1);
        });

        // Unhandled rejection handler
        process.on('unhandledRejection', async (error: Error | unknown) => {
            logger.error('UNHANDLED REJECTION! 💥 Shutting down...', { error });
            await this.executeCleanup();
            process.exit(1);
        });

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
    }
}

export default new ProcessHandler(); 