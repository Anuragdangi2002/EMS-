import { CorsOptions } from 'cors';
import { env } from './env';

export const corsConfig: CorsOptions = {
  // Allow parsed origin string or list of origins. If '*', it permits any, otherwise checks array.
  origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
