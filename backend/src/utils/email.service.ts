import nodemailer from "nodemailer"
import { env } from "../config/env.js"
import { logger } from "../config/logger.js"

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || "localhost",
  port: env.SMTP_PORT || 587,
  secure: env.SMTP_SECURE || false,
  auth: env.SMTP_USER
    ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
    : undefined,
})

if (env.SMTP_HOST) {
  transporter.verify().then(() => logger.info("Email service ready")).catch((err: Error) =>
    logger.error("Email service connection failed:", err)
  )
}

function buildOTPEmailHTML(name: string, otp: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#09090B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background-color:#18181B;border-radius:16px;border:1px solid #3F3F46;overflow:hidden;">

    <!-- Header -->
    <div style="padding:32px 32px 24px;text-align:center;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:12px;background:rgba(249,115,22,0.15);margin-bottom:12px;">
        <span style="font-size:24px;">\uD83D\uDD25</span>
      </div>
      <h1 style="margin:0;font-size:22px;font-weight:700;color:#F97316;">EchoHeat</h1>
      <p style="margin:4px 0 0;font-size:12px;color:#71717A;">Autonomous Thermal Orchestration</p>
    </div>

    <!-- Card -->
    <div style="padding:0 32px 32px;">
      <h2 style="margin:0 0 16px;font-size:18px;font-weight:600;color:#FAFAFA;text-align:center;">
        Password Reset Code
      </h2>
      <p style="margin:0 0 20px;font-size:14px;color:#A1A1AA;line-height:1.6;text-align:center;">
        Hi ${name}, your EchoHeat password reset code is:
      </p>

      <!-- OTP Box -->
      <div style="background-color:#09090B;border:2px solid #F97316;border-radius:12px;padding:20px;margin:0 0 24px;text-align:center;">
        <span style="font-size:40px;font-weight:900;color:#F97316;letter-spacing:12px;font-family:'Courier New',Courier,monospace;">
          ${otp}
        </span>
      </div>

      <!-- Fine print -->
      <p style="margin:0 0 8px;font-size:12px;color:#71717A;text-align:center;">
        \u23F1\uFE0F This code expires in 10 minutes
      </p>
      <p style="margin:0;font-size:12px;color:#52525B;text-align:center;">
        \uD83D\uDD12 If you didn't request this, you can safely ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid #27272A;text-align:center;">
      <p style="margin:0;font-size:11px;color:#3F3F46;">
        &copy; 2024 EchoHeat &middot; Powered by FortyGuard API
      </p>
    </div>
  </div>
</body>
</html>`
}

function buildLoginEmailHTML(
  name: string,
  loginInfo: { time: string; location: string; device: string; ip: string }
): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#09090B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background-color:#18181B;border-radius:16px;border:1px solid #3F3F46;overflow:hidden;">

    <!-- Header -->
    <div style="padding:32px 32px 24px;text-align:center;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:12px;background:rgba(249,115,22,0.15);margin-bottom:12px;">
        <span style="font-size:24px;">\uD83D\uDD10\uFE0F</span>
      </div>
      <h1 style="margin:0;font-size:20px;font-weight:700;color:#FAFAFA;">New Login Detected</h1>
    </div>

    <!-- Card -->
    <div style="padding:0 32px 32px;">
      <p style="margin:0 0 20px;font-size:14px;color:#A1A1AA;line-height:1.6;">
        Hi ${name}, your EchoHeat account was just accessed.
      </p>

      <!-- Details table -->
      <div style="background-color:#09090B;border-radius:12px;padding:16px;margin:0 0 20px;">
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #27272A;">
          <span style="font-size:13px;color:#71717A;">\uD83D\uDD50 Time</span>
          <span style="font-size:13px;color:#FAFAFA;">${loginInfo.time}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #27272A;">
          <span style="font-size:13px;color:#71717A;">\uD83D\uDCCD Location</span>
          <span style="font-size:13px;color:#FAFAFA;">${loginInfo.location}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #27272A;">
          <span style="font-size:13px;color:#71717A;">\uD83D\uDCBB Device</span>
          <span style="font-size:13px;color:#FAFAFA;">${loginInfo.device}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;">
          <span style="font-size:13px;color:#71717A;">\uD83C\uDF10 IP Address</span>
          <span style="font-size:13px;color:#FAFAFA;">${loginInfo.ip}</span>
        </div>
      </div>

      <!-- Warning box -->
      <div style="background-color:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:16px;margin:0 0 20px;">
        <p style="margin:0;font-size:13px;color:#FCA5A5;line-height:1.6;">
          \u26A0\uFE0F If this wasn't you,
          <a href="/forgot-password" style="color:#F97316;text-decoration:none;font-weight:600;">reset your password</a>
          immediately.
        </p>
      </div>

      <p style="margin:0;font-size:13px;color:#71717A;text-align:center;">
        If this was you, no action needed. Stay safe! \uD83D\uDEE1\uFE0F
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid #27272A;text-align:center;">
      <p style="margin:0;font-size:11px;color:#3F3F46;">
        &copy; 2024 EchoHeat &middot; Powered by FortyGuard API
      </p>
    </div>
  </div>
</body>
</html>`
}

export const emailService = {
  async send(options: { to: string; subject: string; html: string; text?: string }): Promise<boolean> {
    try {
      if (!env.SMTP_HOST) {
        logger.info(`[EMAIL MOCK] To: ${options.to} | Subject: ${options.subject}`)
        return true
      }

      await transporter.sendMail({
        from: env.SMTP_FROM || `"EchoHeat" <${env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      })

      logger.info(`Email sent to ${options.to}: ${options.subject}`)
      return true
    } catch (error) {
      logger.error(`Failed to send email to ${options.to}:`, error)
      return false
    }
  },

  async sendOTPEmail(email: string, otp: string, name: string): Promise<void> {
    const html = buildOTPEmailHTML(name, otp)
    await emailService.send({
      to: email,
      subject: `${otp} \u2014 Your EchoHeat verification code`,
      html,
      text: `Your EchoHeat verification code is: ${otp}. It expires in 10 minutes.`,
    })
  },

  async sendLoginNotificationEmail(
    email: string,
    name: string,
    loginInfo: { time: string; location: string; device: string; ip: string }
  ): Promise<void> {
    const html = buildLoginEmailHTML(name, loginInfo)
    await emailService.send({
      to: email,
      subject: "\uD83D\uDD10\uFE0F New sign-in to your EchoHeat account",
      html,
      text: `New login to your EchoHeat account. Time: ${loginInfo.time}, Location: ${loginInfo.location}, Device: ${loginInfo.device}. If this wasn't you, reset your password.`,
    })
  },

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000"
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#09090B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background-color:#18181B;border-radius:16px;border:1px solid #3F3F46;overflow:hidden;">

    <!-- Header -->
    <div style="padding:32px 32px 24px;text-align:center;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:12px;background:rgba(249,115,22,0.15);margin-bottom:12px;">
        <span style="font-size:24px;">\uD83D\uDD25</span>
      </div>
      <h1 style="margin:0;font-size:22px;font-weight:700;color:#F97316;">EchoHeat</h1>
      <p style="margin:4px 0 0;font-size:12px;color:#71717A;">Autonomous Thermal Orchestration</p>
    </div>

    <!-- Card -->
    <div style="padding:0 32px 32px;">
      <h2 style="margin:0 0 16px;font-size:18px;font-weight:600;color:#FAFAFA;text-align:center;">
        \u2709\uFE0F Verify Your Email
      </h2>
      <p style="margin:0 0 24px;font-size:14px;color:#A1A1AA;line-height:1.6;text-align:center;">
        Hi ${name}! Welcome to EchoHeat. Click the button below to
        verify your email address and activate your account.
      </p>

      <!-- Verify Button -->
      <a href="${verifyUrl}" style="
        display:block;
        background:#F97316;
        color:white;
        text-align:center;
        padding:14px 24px;
        border-radius:12px;
        text-decoration:none;
        font-weight:700;
        font-size:15px;
        margin-bottom:20px;
      ">
        \u2713 Verify My Email
      </a>

      <!-- Fine print -->
      <p style="margin:0 0 8px;font-size:12px;color:#71717A;text-align:center;">
        This link expires in 24 hours.
      </p>
      <p style="margin:0;font-size:12px;color:#52525B;text-align:center;">
        \uD83D\uDD12 If you didn't create an account, ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid #27272A;text-align:center;">
      <p style="margin:0;font-size:11px;color:#3F3F46;">
        &copy; 2024 EchoHeat &middot; Powered by FortyGuard API
      </p>
    </div>
  </div>
</body>
</html>`

    await emailService.send({
      to: email,
      subject: "\u2713 Verify your EchoHeat account",
      html,
      text: `Hi ${name}! Verify your email by visiting: ${verifyUrl}. This link expires in 24 hours.`,
    })
  },
}
