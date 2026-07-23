import { emailService } from "../services/email/email.service";
import * as transporterModule from "../services/email/transporter";
import { logger } from "../utils/logger.util";

async function testFailureScenarios() {
  logger.info("🧪 [TEST] Starting Failure Scenarios Verification...");

  // Mock getTransporter to return a failing transporter
  const failingTransporter = {
    sendMail: async (options: any) => {
      logger.info(`🚨 [MOCK SMTP] Attempting send to ${options.to} (MOCKING SMTP FAILURE)`);
      throw new Error("Connection timed out - SMTP server unavailable");
    },
    verify: (cb: any) => cb(new Error("Verification failed"), null),
    close: () => {}
  } as any;

  // Spy/stub getTransporter
  const originalGetTransporter = transporterModule.getTransporter;
  (transporterModule as any).getTransporter = () => failingTransporter;

  try {
    logger.info("👉 Enqueuing a welcome mail to trigger mock SMTP failure and retries...");
    emailService.enqueueEmail({
      to: "retry_target@gmail.com",
      subject: "Welcome",
      templateName: "WELCOME",
      context: { name: "Failure Test User", email: "retry_target@gmail.com", loginLink: "http://login.link" }
    }, 2); // Set max attempts to 2 for fast test execution

    // Wait 3 seconds to let worker process first failure and schedule retry #1 (delay is 2^1 * 1000 = 2s)
    logger.info("⏳ Waiting for worker to process initial failure and delay retry...");
    await new Promise((resolve) => setTimeout(resolve, 3500));

    const finalMetrics = emailService.getMetrics();
    logger.info(`Final Metrics report:`);
    console.log(JSON.stringify(finalMetrics, null, 2));

    if (finalMetrics.emailsFailed < 1) {
      throw new Error("Failure scenario check failed: email should have failed after 2 attempts!");
    }
    if (finalMetrics.retryAttempts < 1) {
      throw new Error("Failure scenario check failed: no retry attempts logged!");
    }

    logger.info("✔ Failure scenarios and retry backoff validated successfully!");
  } finally {
    // Restore original transporter function
    (transporterModule as any).getTransporter = originalGetTransporter;
  }
}

testFailureScenarios().catch((err) => {
  logger.error(`❌ Failure Test Failed: ${err.message || err}`);
  process.exit(1);
});
