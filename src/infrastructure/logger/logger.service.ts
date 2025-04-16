import winston, { Logger } from 'winston';
import config from '@/config';
import { BaseService } from '@/shared/utils/base.service';

interface LogMeta {
    [key: string]: unknown;
}

class LoggerService extends BaseService {
    private logger!: Logger;

    constructor() {
        super();
        if (this.logger) return this;

        this.logger = winston.createLogger({
            level: config.logger.level,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ 
                    filename: 'logs/error.log', 
                    level: 'error',
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
                new winston.transports.File({ 
                    filename: 'logs/combined.log',
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                })
            ]
        });

        if (config.env !== 'production') {
            this.logger.add(new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
            }));
        }
    }

    public info(message: string, meta: LogMeta = {}): void {
        this.logger.info(message, meta);
    }

    public error(message: string, meta: LogMeta = {}): void {
        this.logger.error(message, meta);
    }

    public warn(message: string, meta: LogMeta = {}): void {
        this.logger.warn(message, meta);
    }

    public debug(message: string, meta: LogMeta = {}): void {
        this.logger.debug(message, meta);
    }
}

export const logger = LoggerService.getInstance<LoggerService>(); 