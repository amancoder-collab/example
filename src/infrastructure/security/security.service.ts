import config from '@/config';
import { Request, Response, NextFunction } from 'express';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import helmet from 'helmet';
type CorsMiddleware = (req: Request, res: Response, next: NextFunction) => void;

interface SecurityMiddleware {
    rateLimiter: RateLimitRequestHandler;
    helmet: ReturnType<typeof helmet>;
    cors: CorsMiddleware;
}

class SecurityService {
    private static instance: SecurityService;
    private limiter!: RateLimitRequestHandler;
    private helmetMiddleware!: ReturnType<typeof helmet>;
    private corsMiddleware!: CorsMiddleware;

    private constructor() {
        if (SecurityService.instance) {
            return SecurityService.instance;
        }

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

        this.helmetMiddleware = helmet({
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

        this.corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
            res.header('Access-Control-Allow-Origin', config.corsOrigin || '*');
            res.header('Access-Control-Allow-Methods', 'GET');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.header('Access-Control-Max-Age', '86400'); // 24 hours
            next();
        };

        SecurityService.instance = this;
    }

    public getMiddleware(): SecurityMiddleware {
        return {
            rateLimiter: this.limiter,
            helmet: this.helmetMiddleware,
            cors: this.corsMiddleware
        };
    }

    public static getInstance(): SecurityService {
        if (!SecurityService.instance) {
            SecurityService.instance = new SecurityService();
        }
        return SecurityService.instance;
    }
}

export default SecurityService.getInstance(); 