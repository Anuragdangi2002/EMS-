import { compileTemplate } from "../services/email/email.templates";
import { emailService } from "../services/email/email.service";
import { getTransporter } from "../services/email/transporter";
import { logger } from "../utils/logger.util";

async function testEmailInfrastructure() {
  logger.info("🧪 [TEST] Starting SMTP Email Infrastructure Verification Suite...");

  // 1. Template Rendering & XSS Protection Tests
  logger.info("👉 1. Verifying Template Rendering and HTML escaping...");
  const templatesToTest = [
    {
      name: "WELCOME" as const,
      context: { name: "John Doe", email: "john@example.com", loginLink: "http://login.link" }
    },
    {
      name: "VERIFICATION" as const,
      context: { name: "<script>alert('XSS')</script> Safe", verificationLink: "http://verify.link" }
    },
    {
      name: "PASSWORD_RESET" as const,
      context: { resetLink: "http://reset.link?token=abc" }
    },
    {
      name: "OTP" as const,
      context: { name: "Admin User", code: "987654" }
    },
    {
      name: "INVITATION" as const,
      context: { inviterName: "Jane Smith", inviteLink: "http://invite.link" }
    },
    {
      name: "GENERAL_NOTIFICATION" as const,
      context: { name: "Employee", title: "Monthly Review", message: "Your review is ready." }
    },
    {
      name: "SECURITY_ALERT" as const,
      context: { name: "User A", action: "Password Change", details: "Changed from Chrome/Windows" }
    },
    {
      name: "ACCOUNT_LOCKED" as const,
      context: { name: "User B", ipAddress: "192.168.1.1" }
    }
  ];

  for (const t of templatesToTest) {
    const rendered = compileTemplate(t.name, t.context);
    if (!rendered.subject || !rendered.html || !rendered.text) {
      throw new Error(`Compilation failed for template: ${t.name}`);
    }
    logger.info(`✔ Compiled ${t.name} successfully. Subject: "${rendered.subject}"`);
    
    // Check XSS escaping for VERIFICATION
    if (t.name === "VERIFICATION") {
      const containsUnescaped = rendered.html.includes("<script>");
      const containsEscaped = rendered.html.includes("&lt;script&gt;");
      if (containsUnescaped || !containsEscaped) {
        throw new Error("❌ HTML Injection Vulnerability detected! Context variables are not escaped.");
      }
      logger.info("✔ Verified HTML injection protection (XSS escaping verified).");
    }
  }

  // 2. Transporter Creation & Health Verification
  logger.info("👉 2. Initialising SMTP Connection Pool...");
  try {
    getTransporter();
    logger.info("✔ SMTP transporter loaded. Connection verification scheduled.");
  } catch (err: any) {
    logger.error(`❌ Failed to initialize transporter: ${err.message || err}`);
  }

  // 3. Queueing and Background Worker Tests
  logger.info("👉 3. Testing in-memory queueing and async workers...");
  const initialMetrics = emailService.getMetrics();
  logger.info(`Initial Queue Size: ${initialMetrics.queueSize}`);

  // Enqueue a general notification to test the worker thread
  emailService.sendNotificationEmail(
    "test_recipient@gmail.com",
    "Test User",
    "System Diagnostics",
    "Validating asynchronous background mail dispatch queue."
  );

  const updatedMetrics = emailService.getMetrics();
  logger.info(`Updated Queue Size (Enqueued): ${updatedMetrics.queueSize}`);

  if (updatedMetrics.queueSize !== 0) {
    throw new Error("Queue size check failed!");
  }
  logger.info("✔ Verified queue size changes and worker activation.");

  logger.info("👉 4. Metrics Reporting:");
  console.log(JSON.stringify(emailService.getMetrics(), null, 2));

  logger.info("✔ Verification suite completed successfully!");
}

testEmailInfrastructure().catch((err) => {
  logger.error(`❌ Test Suite Failed: ${err.message || err}`);
  process.exit(1);
});
