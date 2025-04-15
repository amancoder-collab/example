const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
    rateLimitMax: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
    puppeteer: {
        headless: process.env.PUPPETEER_HEADLESS === 'true',
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
            url: process.env.CGC_URL || 'https://www.cgcvideogames.com/en-US/cert-lookup',
            timeout: parseInt(process.env.CGC_TIMEOUT) || 10000
        },
        wata: {
            url: process.env.WATA_URL || 'https://www.watagames.com/verify',
            timeout: parseInt(process.env.WATA_TIMEOUT) || 10000
        }
    },
    logger: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'combined'
    }
};

module.exports = config; 