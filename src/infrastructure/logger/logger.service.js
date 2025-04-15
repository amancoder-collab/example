const winston = require('winston');
const config = require('../../shared/config');
const BaseService = require('../../shared/utils/base.service');

class LoggerService extends BaseService {
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

    info(message, meta = {}) {
        this.logger.info(message, meta);
    }

    error(message, meta = {}) {
        this.logger.error(message, meta);
    }

    warn(message, meta = {}) {
        this.logger.warn(message, meta);
    }

    debug(message, meta = {}) {
        this.logger.debug(message, meta);
    }
}

module.exports = LoggerService.getInstance(); 