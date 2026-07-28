import { CorsOptions } from 'cors';
import { env } from './env';

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) {
      return callback(null, true);
    }
    
    const allowedOrigins = env.CORS_ORIGIN === '*' ? [] : env.CORS_ORIGIN.split(',');
    
    const isAllowed = 
      env.CORS_ORIGIN === '*' ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      /^https?:\/\/localhost(:\d+)?$/.test(origin);
      
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, false); // Don't crash the server, just deny CORS
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
