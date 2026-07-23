import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { env } from './config/env';
import { prisma } from './config/prisma';
import { corsConfig } from './config/cors';
import { helmetConfig } from './config/helmet';
import { logger } from './utils/logger.util';
import { sendSuccess } from './utils/response.util';
import { Messages } from './constants/messages';
import { NotFoundError } from './utils/error.util';
import { errorHandler } from './middlewares/error.middleware';
import apiRouter from './routes';

const app = express();

// 1. Security Headers Configuration
app.use(helmet(helmetConfig));

// 2. Cross-Origin Resource Sharing
app.use(cors(corsConfig));

// 3. Request Payloads Parsing
app.use(express.json());
app.use(cookieParser());

// 4. Request Logging (Redirecting Morgan streams to Winston Logger)
const morganFormat = env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => logger.http(message.trim())
    }
  })
);

// 5. System Availability Probes (Health Check)
app.get('/health', async (_req, res, next) => {
  try {
    // Perform quick PostgreSQL round-trip test
    await prisma.$queryRaw`SELECT 1`;
    sendSuccess(
      res,
      { status: 'healthy', timestamp: new Date() },
      Messages.SYSTEM.HEALTH_CHECK_SUCCESS
    );
  } catch (error) {
    logger.error('Health check failed database connectivity test:', error);
    next(error);
  }
});

// 6. Mount Version 1 Endpoints
app.use('/api/v1', apiRouter);

// 7. Route Fallback for Unmatched Handlers (404)
app.use((_req, _res, next) => {
  next(new NotFoundError(`Resource not found: ${_req.method} ${_req.originalUrl}`));
});

// 8. Global Centralized Error Middleware
app.use(errorHandler);

export default app;
