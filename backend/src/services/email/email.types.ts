export type EmailTemplateName =
  | "WELCOME"
  | "VERIFICATION"
  | "PASSWORD_RESET"
  | "OTP"
  | "INVITATION"
  | "GENERAL_NOTIFICATION"
  | "SECURITY_ALERT"
  | "ACCOUNT_LOCKED";

export interface EmailPlaceholderContext {
  [key: string]: string | number | undefined;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  templateName: EmailTemplateName;
  context: EmailPlaceholderContext;
}

export interface EmailJob {
  id: string;
  options: SendEmailOptions;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: number;
  error?: string;
}

export interface EmailMetrics {
  emailsSent: number;
  emailsFailed: number;
  averageDeliveryTimeMs: number;
  totalDeliveryTimeMs: number;
  retryAttempts: number;
  queueSize: number;
  lastSmtpLatencyMs: number;
}
