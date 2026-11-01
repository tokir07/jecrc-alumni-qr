import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from server or root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const envSchema = z.object({
  PORT: z.preprocess(
    (val) => (val !== undefined && val !== null ? String(val) : '5000'),
    z.string().transform((val) => parseInt(val, 10))
  ),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional().transform((val) => val || process.env.DATABASE_URL || ''),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),
  SESSION_COOKIE_SECRET: z.string().default('jecrc-diwali-session-secret-2026'),
  PUBLIC_APP_URL: z
    .string()
    .optional()
    .transform(
      (val) =>
        val ||
        process.env.APP_BASE_URL ||
        process.env.CLIENT_URL ||
        'http://localhost:5173'
    ),
  APP_BASE_URL: z
    .string()
    .optional()
    .transform(
      (val) =>
        val ||
        process.env.PUBLIC_APP_URL ||
        process.env.CLIENT_URL ||
        'http://localhost:5173'
    ),
  INITIAL_ADMIN_USERNAME: z.string().default('admin'),
  INITIAL_ADMIN_PASSWORD: z.string().default('Admin@JECRC2026!'),
  INITIAL_VOLUNTEER_USERNAME: z.string().default('volunteer1'),
  INITIAL_VOLUNTEER_PASSWORD: z.string().default('Volunteer@JECRC2026!'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  throw new Error('Invalid environment configuration');
}

export const env = parsedEnv.data;
