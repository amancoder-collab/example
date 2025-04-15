const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const config = require('../config/config');

const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later.'
    }
});

const securityMiddleware = {
    rateLimiter: limiter,
    helmet: helmet(),
    cors: (req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
    }
};

module.exports = securityMiddleware; 