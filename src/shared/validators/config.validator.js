const { z } = require('zod');

// Environment variables schema
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).pipe(z.number().positive()).default('3000'),
    RATE_LIMIT_WINDOW_MS: z.string()
        .transform(Number)
        .pipe(z.number().positive())
        .default('900000'),
    RATE_LIMIT_MAX: z.string()
        .transform(Number)
        .pipe(z.number().positive())
        .default('100'),
    PUPPETEER_HEADLESS: z.string()
        .transform(val => val === 'true')
        .default('false'),
    CGC_URL: z.string().url().default('https://www.cgcvideogames.com/en-US/cert-lookup'),
    WATA_URL: z.string().url().default('https://www.watagames.com/verify'),
    CGC_TIMEOUT: z.string()
        .transform(Number)
        .pipe(z.number().positive())
        .default('10000'),
    WATA_TIMEOUT: z.string()
        .transform(Number)
        .pipe(z.number().positive())
        .default('10000'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    LOG_FORMAT: z.enum(['combined', 'common', 'dev', 'short', 'tiny']).default('combined'),
});

// Configuration schema
const configSchema = z.object({
    env: z.enum(['development', 'production', 'test']),
    port: z.number().positive(),
    rateLimitWindowMs: z.number().positive(),
    rateLimitMax: z.number().positive(),
    puppeteer: z.object({
        headless: z.boolean(),
        args: z.array(z.string()),
        defaultViewport: z.null()
    }),
    services: z.object({
        cgc: z.object({
            url: z.string().url(),
            timeout: z.number().positive()
        }),
        wata: z.object({
            url: z.string().url(),
            timeout: z.number().positive()
        })
    }),
    logger: z.object({
        level: z.enum(['error', 'warn', 'info', 'debug']),
        format: z.enum(['combined', 'common', 'dev', 'short', 'tiny'])
    })
});

module.exports = {
    envSchema,
    configSchema
}; 