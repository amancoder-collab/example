import 'dotenv/config';
import express from '@/infrastructure/server/express';
import { logger } from '@/infrastructure/logger/logger.service';

process.on('uncaughtException', (err: Error) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', { error: err });
    process.exit(1);
});

const server = express.start();

process.on('unhandledRejection', (err: Error) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...', { error: err });
    server.close(() => {
        process.exit(1);
    });
}); 