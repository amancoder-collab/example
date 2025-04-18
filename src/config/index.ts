import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: ".env" });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default("8000"),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default("900000"),
  RATE_LIMIT_MAX: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default("100"),
  CGC_URL: z
    .string()
    .url()
    .default("https://www.cgcvideogames.com/en-US/cert-lookup"),
  WATA_URL: z.string().url().default("https://www.watagames.com/verify"),
  CGC_TIMEOUT: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default("10000"),
  WATA_TIMEOUT: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default("10000"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  LOG_FORMAT: z
    .enum(["combined", "common", "dev", "short", "tiny"])
    .default("combined"),
  CORS_ORIGIN: z.string().optional(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
});

const env = envSchema.parse(process.env);

const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: env.RATE_LIMIT_MAX,
  corsOrigin: env.CORS_ORIGIN,
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  services: {
    cgc: {
      url: env.CGC_URL,
      timeout: env.CGC_TIMEOUT,
    },
    wata: {
      url: env.WATA_URL,
      timeout: env.WATA_TIMEOUT,
    },
  },
  puppeteer: {
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
    ],
  },
  logger: {
    level: env.LOG_LEVEL,
    format: env.LOG_FORMAT,
  },
} as const;

export type Config = typeof config;

export default config;
