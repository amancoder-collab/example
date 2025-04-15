require('dotenv').config();
const { envSchema, configSchema } = require('../validators/config.validator');

// Validate environment variables
const env = envSchema.parse(process.env);

// Create config object
const config = {
    env: env.NODE_ENV,
    port: env.PORT,
    rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: env.RATE_LIMIT_MAX,
    puppeteer: {
        headless: env.PUPPETEER_HEADLESS,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--start-maximized',
            '--window-size=1920,1080'
        ],
        defaultViewport: null
    },
    services: {
        cgc: {
            url: env.CGC_URL,
            timeout: env.CGC_TIMEOUT
        },
        wata: {
            url: env.WATA_URL,
            timeout: env.WATA_TIMEOUT
        }
    },
    logger: {
        level: env.LOG_LEVEL,
        format: env.LOG_FORMAT
    }
};

// Validate final config
const validatedConfig = configSchema.parse(config);

module.exports = validatedConfig; 