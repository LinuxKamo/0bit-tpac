import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// In development, Resend only allows sending from onboarding@resend.dev unless the domain is verified.
const FROM = process.env.NODE_ENV === "development" && !process.env.SENDER_EMAIL
  ? "Tshimologong Platform <onboarding@resend.dev>"
  : `Tshimologong Digital Precinct <${process.env.SENDER_EMAIL || "noreply@tshimologong.co.za"}>`;
const BRAND_COLOR = "#5b4fcf";
const PLATFORM    = "Tshimologong Platform";
const BASE_URL    = process.env.FRONTEND_URL || "https://tshimologong.co.za";

// ── Shared layout ──────────────────────────────────────────────────────────────

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${PLATFORM}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header / Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${BRAND_COLOR};width:36px;height:36px;border-radius:8px;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-weight:800;font-size:18px;font-family:'Helvetica Neue',Arial,sans-serif;line-height:36px;">T</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <span style="color:#1a1a2e;font-weight:700;font-size:15px;font-family:'Helvetica Neue',Arial,sans-serif;">Tshimologong</span>
                    <br/>
                    <span style="color:#9ca3af;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">Digital Precinct</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

              <!-- Accent bar -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${BRAND_COLOR};height:4px;"></td>
                </tr>
              </table>

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:40px 48px;">
                    ${content}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 0 0;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                This email was sent by <strong style="color:#6b7280;">Tshimologong Digital Precinct</strong>.<br/>
                Pan-African Digital Innovation Community &mdash; Johannesburg, South Africa
              </p>
              <p style="margin:10px 0 0;color:#c4c4cc;font-size:11px;">
                &copy; ${new Date().getFullYear()} Tshimologong Digital Precinct. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function primaryButton(text: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      <td style="background:${BRAND_COLOR};border-radius:8px;">
        <a href="${href}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;font-family:'Helvetica Neue',Arial,sans-serif;letter-spacing:0.01em;">
          ${text}
        </a>
      </td>
    </tr>
  </table>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;color:#111827;font-size:22px;font-weight:800;font-family:'Helvetica Neue',Arial,sans-serif;line-height:1.3;">${text}</h1>`;
}

function body(text: string): string {
  return `<p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">${text}</p>`;
}

function muted(text: string): string {
  return `<p style="margin:24px 0 0;color:#9ca3af;font-size:12px;line-height:1.6;">${text}</p>`;
}

function divider(): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td style="border-top:1px solid #f3f4f6;"></td></tr>
  </table>`;
}

async function send(payload: Parameters<typeof resend.emails.send>[0]) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️  [MAIL] RESEND_API_KEY not set — email skipped:", payload.to);
    return;
  }
  const { data, error } = await resend.emails.send(payload);
  if (error) {
    // Log but do NOT throw — email failure must never block the API response.
    // The invite link is stored in the DB and can be resent.
    console.error("❌ [MAIL] Resend error:", JSON.stringify(error));
    console.warn("⚠️  [MAIL] Email was NOT delivered but record was saved. Use resend-invite to retry.");
    return;
  }
  console.log(`✅ [MAIL] Sent to ${Array.isArray(payload.to) ? payload.to.join(", ") : payload.to} (id: ${data?.id})`);
}

// ── Invite email ───────────────────────────────────────────────────────────────

export async function sendInviteEmail(to: string, inviteLink: string, name: string) {
  await send({
    from:    FROM,
    to,
    subject: `You've been invited to join the Tshimologong Platform`,
    html: layout(`
      ${heading("You've been invited")}
      ${body(`Hi ${name},`)}
      ${body(`You have been invited to join the <strong>Tshimologong Platform</strong> as a Platform Administrator. Click the button below to set your password and activate your account.`)}
      ${primaryButton("Accept Invitation & Set Password", inviteLink)}
      ${divider()}
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:#f9fafb;border-radius:8px;padding:16px;">
            <p style="margin:0 0 4px;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Invitation link</p>
            <p style="margin:0;color:#5b4fcf;font-size:12px;word-break:break-all;">${inviteLink}</p>
          </td>
        </tr>
      </table>
      ${muted("This invitation link expires in <strong>7 days</strong>. If you did not expect this invitation, you can safely ignore this email — no account will be created without your action.")}
    `),
  });
}

// ── Verification email ─────────────────────────────────────────────────────────

export async function sendVerificationEmail(to: string, verifyLink: string) {
  await send({
    from:    FROM,
    to,
    subject: `Verify your Tshimologong Platform account`,
    html: layout(`
      ${heading("Verify your email address")}
      ${body("Thank you for registering on the Tshimologong Platform. Please verify your email address to activate your account and access the community.")}
      ${primaryButton("Verify Email Address", verifyLink)}
      ${muted("If you did not create an account on the Tshimologong Platform, you can safely ignore this email.")}
    `),
  });
}

// ── Password reset email ───────────────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  await send({
    from:    FROM,
    to,
    subject: `Reset your Tshimologong Platform password`,
    html: layout(`
      ${heading("Password reset request")}
      ${body("We received a request to reset the password for your Tshimologong Platform account. Click the button below to choose a new password.")}
      ${primaryButton("Reset Password", resetLink)}
      ${divider()}
      ${muted("This reset link expires in <strong>1 hour</strong>. If you did not request a password reset, no action is needed — your password remains unchanged.")}
    `),
  });
}

// ── Verification code email ────────────────────────────────────────────────────

export async function sendVerificationCodeEmail(to: string, code: string) {
  await send({
    from:    FROM,
    to,
    subject: `Your Tshimologong Platform verification code`,
    html: layout(`
      ${heading("Your verification code")}
      ${body("Use the code below to verify your identity. Enter it in the app within 15 minutes.")}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr>
          <td align="center" style="background:#f5f5f7;border:1px solid #e5e7eb;border-radius:12px;padding:24px;">
            <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#111827;font-family:'Courier New',monospace;">${code}</span>
          </td>
        </tr>
      </table>
      ${muted("This code expires in <strong>15 minutes</strong>. Do not share this code with anyone. Tshimologong staff will never ask for your code.")}
    `),
  });
}
