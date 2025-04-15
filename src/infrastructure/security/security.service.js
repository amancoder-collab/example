const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const config = require('../../shared/config');
const BaseService = require('../../shared/utils/base.service');

class SecurityService extends BaseService {
    constructor() {
        super();
        if (this.limiter) return this;

        this.limiter = rateLimit({
            windowMs: config.rateLimitWindowMs,
            max: config.rateLimitMax,
            message: {
                status: 'error',
                message: 'Too many requests from this IP, please try again later.'
            },
            standardHeaders: true,
            legacyHeaders: false
        });

        this.helmet = helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", 'data:', 'https:'],
                }
            },
            crossOriginEmbedderPolicy: true,
            crossOriginOpenerPolicy: true,
            crossOriginResourcePolicy: { policy: "cross-origin" },
            dnsPrefetchControl: true,
            frameguard: { action: 'deny' },
            hidePoweredBy: true,
            hsts: true,
            ieNoOpen: true,
            noSniff: true,
            referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
            xssFilter: true
        });

        this.cors = (req, res, next) => {
            res.header('Access-Control-Allow-Origin', config.corsOrigin || '*');
            res.header('Access-Control-Allow-Methods', 'GET');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.header('Access-Control-Max-Age', '86400'); // 24 hours
            next();
        };
    }

    getMiddleware() {
        return {
            rateLimiter: this.limiter,
            helmet: this.helmet,
            cors: this.cors
        };
    }
}

module.exports = SecurityService.getInstance(); 