import nodemailer from "nodemailer";
import { logger } from "../../utils/logger.util";
import { env } from "../../config/env";

let transporter: nodemailer.Transporter | null = null;

export function getTransporter(): nodemailer.Transporter {
  if (transporter) {
    return transporter;
  }

  logger.info(`📧 Initialising pooled production SMTP transporter for host: ${env.SMTP_HOST}`);

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE, // true for port 465, false for 587 or 25
    pool: true,              // Re-use SMTP connections
    maxConnections: env.SMTP_POOL_MAX_CONNECTIONS,
    maxMessages: env.SMTP_POOL_MAX_MESSAGES,
    connectionTimeout: env.SMTP_CONNECTION_TIMEOUT,
    socketTimeout: env.SMTP_SOCKET_TIMEOUT,
    auth: {
      user: env.SMTP_USERNAME,
      pass: env.SMTP_PASSWORD,
    },
    tls: {
      // Strictly enforce secure certificates in production, bypass only in development
      rejectUnauthorized: env.NODE_ENV === "production",
    },
  });

  // Verify SMTP connection on startup
  transporter.verify((error) => {
    if (error) {
      logger.error(`❌ SMTP Transporter verification failed: ${error.message || error}`);
    } else {
      logger.info("✔ SMTP Transporter established connection pool successfully.");
    }
  });

  return transporter;
}

// Graceful connection pool shutdown
const gracefulShutdown = () => {
  if (transporter) {
    logger.info("🔌 Closing SMTP connection pool gracefully...");
    transporter.close();
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
