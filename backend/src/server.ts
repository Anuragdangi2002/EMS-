import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { logger } from './utils/logger.util';

const startServer = async () => {
  try {
    logger.info('🚀 Bootstrapping EMS Backend Foundation...');

    // Verify database connection at startup
    logger.info('⏳ Verifying database connection...');
    await prisma.$connect();
    logger.info('✔ Database connection established successfully.');

    // Start Express listener
    app.listen(env.PORT, () => {
      logger.info(`✔ Server listening on port ${env.PORT} in [${env.NODE_ENV}] mode.`);
    });
  } catch (error) {
    logger.error('❌ Critical startup failure:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Handle process termination events for clean connection closes
process.on('SIGTERM', async () => {
  logger.warn('⚠️ SIGTERM signal received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.warn('⚠️ SIGINT signal received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
