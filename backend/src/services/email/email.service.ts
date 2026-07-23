import { getTransporter } from "./transporter";
import { compileTemplate } from "./email.templates";
import { EmailJob, EmailMetrics, SendEmailOptions } from "./email.types";
import { logger } from "../../utils/logger.util";
import { env } from "../../config/env";

export class EmailService {
  private queue: EmailJob[] = [];
  private isWorkerRunning = false;
  private metrics: EmailMetrics = {
    emailsSent: 0,
    emailsFailed: 0,
    averageDeliveryTimeMs: 0,
    totalDeliveryTimeMs: 0,
    retryAttempts: 0,
    queueSize: 0,
    lastSmtpLatencyMs: 0,
  };

  /**
   * Add a mail dispatch job to the asynchronous background queue.
   */
  public enqueueEmail(options: SendEmailOptions, maxAttempts = 3): void {
    const job: EmailJob = {
      id: Math.random().toString(36).substring(7),
      options,
      attempts: 0,
      maxAttempts,
      nextAttemptAt: Date.now(),
    };

    this.queue.push(job);
    this.metrics.queueSize = this.queue.length;

    // Mask sensitive details when logging
    const maskedTo = this.maskEmail(Array.isArray(options.to) ? options.to[0] : options.to);
    logger.info(`📥 Email job [${job.id}] enqueued to ${maskedTo} with template: ${options.templateName}`);

    // Fire worker loop asynchronously
    void this.runQueueWorker();
  }

  /**
   * Asynchronous queue processing loop worker.
   */
  private async runQueueWorker(): Promise<void> {
    if (this.isWorkerRunning) {
      return;
    }

    this.isWorkerRunning = true;

    try {
      while (this.queue.length > 0) {
        // Find first job that is ready to execute based on schedule/nextAttemptAt
        const now = Date.now();
        const jobIndex = this.queue.findIndex((j) => j.nextAttemptAt <= now);

        if (jobIndex === -1) {
          // If items are in queue but none are ready to retry yet, break to wait
          break;
        }

        const job = this.queue.splice(jobIndex, 1)[0];
        this.metrics.queueSize = this.queue.length;

        try {
          await this.executeMailJob(job);
        } catch (err: any) {
          await this.handleJobFailure(job, err);
        }
      }
    } finally {
      this.isWorkerRunning = false;

      // If there are still pending scheduled items in the queue, schedule a re-run
      if (this.queue.length > 0) {
        const nextJob = this.queue.reduce((earliest, current) =>
          current.nextAttemptAt < earliest.nextAttemptAt ? current : earliest
        );
        const delay = Math.max(0, nextJob.nextAttemptAt - Date.now());
        setTimeout(() => void this.runQueueWorker(), delay);
      }
    }
  }

  /**
   * Connect to pooled SMTP transporter and send the compiled email template.
   */
  private async executeMailJob(job: EmailJob): Promise<void> {
    const startTime = Date.now();
    const transporter = getTransporter();
    const { to, subject, templateName, context } = job.options;

    // Compile dynamic responsive templates safely
    const compiled = compileTemplate(templateName, context);
    const fromAddress = `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`;

    const mailOptions: any = {
      from: fromAddress,
      to,
      subject,
      text: compiled.text,
      html: compiled.html,
    };

    if (env.SMTP_REPLY_TO) {
      mailOptions.replyTo = env.SMTP_REPLY_TO;
    }

    // Deliver email
    const smtpResponse = await transporter.sendMail(mailOptions);
    const latency = Date.now() - startTime;

    // Update operational metrics
    this.metrics.emailsSent++;
    this.metrics.totalDeliveryTimeMs += latency;
    this.metrics.averageDeliveryTimeMs = Math.round(
      this.metrics.totalDeliveryTimeMs / this.metrics.emailsSent
    );
    this.metrics.lastSmtpLatencyMs = latency;

    const maskedTo = this.maskEmail(Array.isArray(to) ? to[0] : to);
    logger.info(
      `✔ Email job [${job.id}] successfully sent to ${maskedTo} in ${latency}ms. Response: ${smtpResponse.response}`
    );
  }

  /**
   * Handle job failures by scheduling retry with exponential backoff.
   */
  private async handleJobFailure(job: EmailJob, error: any): Promise<void> {
    const maskedTo = this.maskEmail(
      Array.isArray(job.options.to) ? job.options.to[0] : job.options.to
    );
    logger.error(
      `❌ Failed mail attempt for job [${job.id}] to ${maskedTo}: ${error.message || error}`
    );

    if (env.NODE_ENV === "development") {
      logger.warn(`⚠️ [DEVELOPMENT FALLBACK] SMTP failed to deliver mail to ${job.options.to}. Details:`);
      if (job.options.context.resetLink) {
        logger.warn(`🔗 Reset Link: ${job.options.context.resetLink}`);
      }
      if (job.options.context.verificationLink) {
        logger.warn(`🔗 Verification Link: ${job.options.context.verificationLink}`);
      }
      if (job.options.context.code) {
        logger.warn(`🔑 Verification Code: ${job.options.context.code}`);
      }
    }

    if (job.attempts < job.maxAttempts - 1) {
      job.attempts++;
      this.metrics.retryAttempts++;
      // Exponential backoff: 2s, 4s, 8s, 16s...
      const delayMs = Math.pow(2, job.attempts) * 1000;
      job.nextAttemptAt = Date.now() + delayMs;
      job.error = error.message || String(error);

      // Re-enqueue scheduled retry job
      this.queue.push(job);
      this.metrics.queueSize = this.queue.length;

      logger.warn(
        `🔁 Job [${job.id}] scheduled for retry #${job.attempts} in ${delayMs / 1000}s`
      );
    } else {
      // Exceeded max retries -> permanent failure
      this.metrics.emailsFailed++;
      logger.error(
        `🚨 Job [${job.id}] to ${maskedTo} permanently failed after ${job.maxAttempts} attempts.`
      );
    }
  }

  /**
   * Mask email addresses in log outputs to protect personal info.
   */
  private maskEmail(email: string): string {
    if (!email) return "";
    const parts = email.split("@");
    if (parts.length !== 2) return "***";
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 2) {
      return `*@${domain}`;
    }
    return `${name.substring(0, 2)}***${name.substring(name.length - 1)}@${domain}`;
  }

  /**
   * Retrieve active monitoring metrics.
   */
  public getMetrics(): EmailMetrics {
    return { ...this.metrics };
  }

  // --- Unified Application Methods ---

  public sendVerificationEmail(to: string, name: string, verificationLink: string): void {
    this.enqueueEmail({
      to,
      subject: "Verify Your Email Address - PeopleOps",
      templateName: "VERIFICATION",
      context: { name, verificationLink },
    });
  }

  public sendPasswordResetEmail(to: string, resetLink: string): void {
    this.enqueueEmail({
      to,
      subject: "Reset Your Password - PeopleOps",
      templateName: "PASSWORD_RESET",
      context: { resetLink },
    });
  }

  public sendWelcomeEmail(to: string, name: string, loginLink: string): void {
    this.enqueueEmail({
      to,
      subject: `Welcome to PeopleOps, ${name}!`,
      templateName: "WELCOME",
      context: { name, email: to, loginLink },
    });
  }

  public sendOTPEmail(to: string, name: string, code: string): void {
    this.enqueueEmail({
      to,
      subject: "Your One-Time Password (OTP) - PeopleOps",
      templateName: "OTP",
      context: { name, code },
    });
  }

  public sendInviteEmail(to: string, inviterName: string, inviteLink: string): void {
    this.enqueueEmail({
      to,
      subject: "Invitation to Join PeopleOps Workspace",
      templateName: "INVITATION",
      context: { inviterName, inviteLink },
    });
  }

  public sendNotificationEmail(to: string, name: string, title: string, message: string): void {
    this.enqueueEmail({
      to,
      subject: title,
      templateName: "GENERAL_NOTIFICATION",
      context: { name, title, message },
    });
  }

  public sendSecurityAlertEmail(to: string, name: string, action: string, details: string): void {
    this.enqueueEmail({
      to,
      subject: "Security Alert - PeopleOps",
      templateName: "SECURITY_ALERT",
      context: { name, action, details },
    });
  }

  public sendAccountLockedEmail(to: string, name: string, ipAddress: string): void {
    this.enqueueEmail({
      to,
      subject: "Account Locked Alert - PeopleOps",
      templateName: "ACCOUNT_LOCKED",
      context: { name, ipAddress },
    });
  }
}

export const emailService = new EmailService();
