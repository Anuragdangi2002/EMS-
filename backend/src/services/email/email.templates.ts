import { EmailTemplateName, EmailPlaceholderContext } from "./email.types";

/**
 * Escapes HTML characters in placeholders to prevent HTML/XSS injection.
 */
function escapeHtml(value: any): string {
  if (value === undefined || value === null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Renders the parent HTML layout wrapping the dynamic email content.
 */
function renderLayout(title: string, contentHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .body-bg { background-color: #0f172a !important; }
      .card-bg { background-color: #1e293b !important; border-color: #334155 !important; }
      .title-text { color: #3b82f6 !important; }
      .body-text { color: #cbd5e1 !important; }
      .meta-text { color: #94a3b8 !important; }
      .hr-rule { border-top-color: #334155 !important; }
    }
  </style>
</head>
<body class="body-bg" style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <div style="padding: 40px 20px; text-align: center;">
    <div class="card-bg" style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); padding: 36px; text-align: left;">
      <!-- Header Logo / Brand -->
      <div style="font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 24px; text-align: center;" class="title-text">
        PeopleOps
      </div>
      
      <!-- Content -->
      <div class="body-text" style="font-size: 14px; line-height: 1.6; color: #475569;">
        ${contentHtml}
      </div>
      
      <!-- Footer Info -->
      <hr class="hr-rule" style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 32px; margin-bottom: 24px;" />
      <p class="meta-text" style="font-size: 11px; line-height: 1.5; color: #94a3b8; text-align: center; margin: 0;">
        This is an automated system email from PeopleOps. Please do not reply directly.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export interface RenderedTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Compiles a specific template by substituting escaped placeholder variables.
 */
export function compileTemplate(
  templateName: EmailTemplateName,
  context: EmailPlaceholderContext
): RenderedTemplate {
  // Pre-escape all variables for safety
  const safe: Record<string, string> = {};
  for (const [key, value] of Object.entries(context)) {
    safe[key] = escapeHtml(value);
  }

  let subject = "";
  let html = "";
  let text = "";

  switch (templateName) {
    case "WELCOME":
      subject = `Welcome to PeopleOps, ${safe.name}!`;
      html = renderLayout(
        "Welcome to PeopleOps",
        `
        <h2 style="font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 16px;">Welcome to the Team!</h2>
        <p>Hi ${safe.name},</p>
        <p>Your PeopleOps employee account has been created successfully. You can now access the workspace to manage your shifts, attendance logs, and leave requests.</p>
        <p>Please log in using your registered work email: <strong>${safe.email}</strong></p>
        <div style="text-align: center; margin-top: 28px; margin-bottom: 28px;">
          <a href="${safe.loginLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
            Access Workspace
          </a>
        </div>
        `
      );
      text = `Welcome to PeopleOps, ${safe.name}! Your account is ready. Access your workspace: ${safe.loginLink}`;
      break;

    case "VERIFICATION":
      subject = "Verify Your Email Address - PeopleOps";
      html = renderLayout(
        "Email Verification",
        `
        <h2 style="font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 16px;">Verify Your Email Address</h2>
        <p>Hi ${safe.name},</p>
        <p>Please verify your email address to activate your security profile. Click the button below to complete verification:</p>
        <div style="text-align: center; margin-top: 28px; margin-bottom: 28px;">
          <a href="${safe.verificationLink}" style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px;">
            Verify Email
          </a>
        </div>
        <p style="font-size: 12px; color: #94a3b8;">This link is valid for 24 hours.</p>
        `
      );
      text = `Please verify your email address: ${safe.verificationLink}`;
      break;

    case "PASSWORD_RESET":
      subject = "Reset Your Password - PeopleOps";
      html = renderLayout(
        "Reset Your Password",
        `
        <h2 style="font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 16px;">Reset Your Password</h2>
        <p>We received a request to reset your password. Click the button below to set a new password. This link is valid for 1 hour.</p>
        <div style="text-align: center; margin-top: 28px; margin-bottom: 28px;">
          <a href="${safe.resetLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
            Reset Password
          </a>
        </div>
        <p style="font-size: 12px; color: #94a3b8;">If you did not request this, you can safely ignore this email.</p>
        `
      );
      text = `Reset your password by visiting this link: ${safe.resetLink}`;
      break;

    case "OTP":
      subject = "Your One-Time Password (OTP) - PeopleOps";
      html = renderLayout(
        "One-Time Password (OTP)",
        `
        <h2 style="font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 16px;">Verification Code</h2>
        <p>Hi ${safe.name},</p>
        <p>Use the verification code below to authenticate your action. Do not share this code with anyone:</p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #0f172a; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
            ${safe.code}
          </span>
        </div>
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">This code is valid for 10 minutes.</p>
        `
      );
      text = `Your One-Time Password (OTP) verification code is: ${safe.code}`;
      break;

    case "INVITATION":
      subject = "Invitation to Join PeopleOps Workspace";
      html = renderLayout(
        "Workspace Invitation",
        `
        <h2 style="font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 16px;">You've Been Invited!</h2>
        <p>You have been invited by <strong>${safe.inviterName}</strong> to join the team workspace at PeopleOps.</p>
        <div style="text-align: center; margin-top: 28px; margin-bottom: 28px;">
          <a href="${safe.inviteLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px;">
            Accept Invitation
          </a>
        </div>
        <p style="font-size: 12px; color: #94a3b8;">This invite is valid for 7 days.</p>
        `
      );
      text = `You have been invited by ${safe.inviterName} to join PeopleOps: ${safe.inviteLink}`;
      break;

    case "GENERAL_NOTIFICATION":
      subject = safe.customSubject || "New Update - PeopleOps";
      html = renderLayout(
        safe.title || "Notification Alert",
        `
        <h2 style="font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 16px;">${safe.title || "Notification Alert"}</h2>
        <p>Hi ${safe.name},</p>
        <p>${safe.message}</p>
        `
      );
      text = `Notification Alert for ${safe.name}: ${safe.message}`;
      break;

    case "SECURITY_ALERT":
      subject = "Security Alert - PeopleOps";
      html = renderLayout(
        "Security Alert",
        `
        <h2 style="font-size: 20px; font-weight: bold; color: #dc2626; margin-top: 0; margin-bottom: 16px;">Security Warning</h2>
        <p>Hi ${safe.name},</p>
        <p>A critical update or changes were made to your PeopleOps security profile: <strong>${safe.action}</strong></p>
        <p>Details: ${safe.details}</p>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">If you did not perform this action, please contact security administration immediately.</p>
        `
      );
      text = `Security Warning: ${safe.action} - ${safe.details}`;
      break;

    case "ACCOUNT_LOCKED":
      subject = "Account Locked Alert - PeopleOps";
      html = renderLayout(
        "Account Locked",
        `
        <h2 style="font-size: 20px; font-weight: bold; color: #dc2626; margin-top: 0; margin-bottom: 16px;">Account Access Suspended</h2>
        <p>Hi ${safe.name},</p>
        <p>Your account access has been temporarily suspended due to consecutive failed sign-in attempts originating from IP address: <strong>${safe.ipAddress}</strong>.</p>
        <p>To unlock your profile, please contact your System Administrator or HR Operations team.</p>
        `
      );
      text = `Account Locked Alert for ${safe.name}. Failed sign-in attempts from IP: ${safe.ipAddress}`;
      break;

    default:
      throw new Error(`Unsupported email template: ${templateName}`);
  }

  return { subject, html, text };
}
