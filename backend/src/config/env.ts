import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root directory .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
  SMTP_PORT: z.coerce.number().int().positive('SMTP_PORT must be a positive integer'),
  SMTP_SECURE: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  SMTP_USERNAME: z.string().min(1, 'SMTP_USERNAME is required'),
  SMTP_PASSWORD: z.string().min(1, 'SMTP_PASSWORD is required'),
  SMTP_FROM_EMAIL: z.string().email('SMTP_FROM_EMAIL must be a valid email'),
  SMTP_FROM_NAME: z.string().min(1, 'SMTP_FROM_NAME is required'),
  SMTP_REPLY_TO: z.string().email('SMTP_REPLY_TO must be a valid email').optional(),
  SMTP_CONNECTION_TIMEOUT: z.coerce.number().int().positive().default(5000),
  SMTP_SOCKET_TIMEOUT: z.coerce.number().int().positive().default(5000),
  SMTP_POOL_MAX_CONNECTIONS: z.coerce.number().int().positive().default(5),
  SMTP_POOL_MAX_MESSAGES: z.coerce.number().int().positive().default(100)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
