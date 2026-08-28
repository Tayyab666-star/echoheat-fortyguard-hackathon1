import crypto from "crypto"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import UAParser from "ua-parser-js"
import geoip from "geoip-lite"
import { env } from "../../../config/env.js"
import { authRepository } from "../repositories/auth.repository.js"
import { AppError } from "../../../utils/AppError.js"
import { Alert } from "../../alerts/Alert.model.js"
import { logger } from "../../../config/logger.js"
import { emailService } from "../../../utils/email.service.js"
import type { JwtPayload } from "../../../middleware/authenticate.js"
import type { IUser, UserRole } from "../User.model.js"

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

const ACCESS_TOKEN_EXPIRY = "15m"
const REFRESH_TOKEN_EXPIRY = "7d"
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

export class AuthService {
  async register(data: {
    email: string
    password: string
    name: string
    username: string
    role?: UserRole
    organization?: string
  }) {
    // Check if username is already taken
    const existingUsername = await authRepository.findByUsername(data.username)
    if (existingUsername) {
      throw AppError.badRequest("Username is already taken")
    }

    // Check if email is already registered
    const existingEmail = await authRepository.findByEmail(data.email)
    if (existingEmail) {
      throw AppError.badRequest("Email is already registered")
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const tokenHash = hashToken(verificationToken)
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const user = await authRepository.create({
      ...data,
      organization: data.organization || "Personal",
      status: "pending_verification",
      emailVerificationToken: tokenHash,
      emailVerificationExpiry: tokenExpiry,
    })

    // Send verification email (fire and forget)
    emailService.sendVerificationEmail(user.email, user.name, verificationToken).catch((err) =>
      logger.error("Failed to send verification email:", err)
    )

    return {
      success: true,
      message: "Check your email to verify your account",
    }
  }

  async checkUsername(username: string) {
    const user = await authRepository.findByUsername(username)
    return { available: !user }
  }

  async verifyEmail(token: string) {
    const tokenHash = hashToken(token)
    const user = await authRepository.findUserByVerificationToken(tokenHash)

    if (!user) {
      throw AppError.badRequest("Invalid or expired verification token")
    }

    if (user.emailVerificationExpiry && new Date() > user.emailVerificationExpiry) {
      throw AppError.badRequest("Verification token has expired. Please request a new one.")
    }

    // Activate user
    user.status = "active"
    user.emailVerificationToken = undefined
    user.emailVerificationExpiry = undefined
    await user.save()

    return { success: true, message: "Email verified successfully" }
  }

  async resendVerification(email: string) {
    const user = await authRepository.findByEmail(email)
    if (!user) {
      // Don't reveal if email exists
      return { message: "If an account exists with this email, a verification link has been sent" }
    }

    if (user.status === "active") {
      return { message: "If an account exists with this email, a verification link has been sent" }
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const tokenHash = hashToken(verificationToken)
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await authRepository.setVerificationToken(user._id.toString(), tokenHash, tokenExpiry)

    // Send verification email (fire and forget)
    emailService.sendVerificationEmail(user.email, user.name, verificationToken).catch((err) =>
      logger.error("Failed to send verification email:", err)
    )

    return { message: "If an account exists with this email, a verification link has been sent" }
  }

  async login(email: string, password: string, userAgent?: string, ip?: string) {
    const user = await authRepository.findByEmail(email)
    if (!user || !(await user.comparePassword(password))) {
      throw AppError.unauthorized("Invalid email or password")
    }
    if (!user.isActive) {
      throw AppError.forbidden("Account has been deactivated. Contact your administrator.")
    }
    if (user.status === "pending_verification") {
      throw AppError.forbidden("Please verify your email before signing in. Check your inbox for the verification link.")
    }
    const tokens = await this.generateAndStoreTokens(user.id, user.email, user.role, user.organization, userAgent, ip)

    // Send login notification email (fire and forget — never blocks response)
    try {
      const parser = new UAParser(userAgent || "")
      const browserInfo = parser.getBrowser()
      const osInfo = parser.getOS()
      const device = `${browserInfo.name || "Unknown browser"} on ${osInfo.name || "Unknown OS"}`

      const rawIP = (ip || "").replace("::ffff:", "")
      const geo = geoip.lookup(rawIP)
      const location = geo ? `${geo.city || "Unknown city"}, ${geo.country || "Unknown country"}` : "Unknown location"

      const loginTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Karachi",
        dateStyle: "medium",
        timeStyle: "short",
      })

      emailService.sendLoginNotificationEmail(user.email, user.name, {
        time: loginTime,
        location,
        device,
        ip: rawIP || "Unknown",
      }).catch((err) => logger.error("Login notification email failed:", err))
    } catch (err) {
      logger.error("Failed to send login notification:", err)
    }

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    }
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken)
      await authRepository.removeRefreshToken(userId, tokenHash)
    }
    return { message: "Logged out successfully" }
  }

  async logoutAll(userId: string) {
    await authRepository.removeAllRefreshTokens(userId)
    return { message: "Logged out from all devices" }
  }

  async getMe(userId: string) {
    const user = await authRepository.findById(userId)
    if (!user) throw AppError.notFound("User not found")

    const activeAlerts = await Alert.countDocuments({ status: "pending", organization: user.organization })

    return {
      user: this.sanitizeUser(user),
      connectedIntegrations: user.connectedIntegrations,
      onboardingComplete: user.onboardingComplete,
      activeAlertsCount: activeAlerts,
    }
  }

  async updateMe(
    userId: string,
    data: { name?: string; organization?: string; onboardingComplete?: boolean }
  ) {
    const user = await authRepository.updateProfile(userId, data)
    if (!user) throw AppError.notFound("User not found")
    return { user: this.sanitizeUser(user) }
  }

  async refreshTokens(refreshToken: string, userAgent?: string, ip?: string) {
    const tokenHash = hashToken(refreshToken)

    let decoded: JwtPayload
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as unknown as JwtPayload
    } catch {
      throw AppError.unauthorized("Invalid or expired refresh token")
    }

    const user = await authRepository.findUserByRefreshToken(tokenHash)
    if (!user) {
      throw AppError.unauthorized("Refresh token has been revoked. Please log in again.")
    }

    const storedToken = user.refreshTokens.find((rt) => rt.token === tokenHash)
    if (!storedToken || new Date(storedToken.expiresAt) < new Date()) {
      throw AppError.unauthorized("Refresh token has expired. Please log in again.")
    }

    await authRepository.removeRefreshToken(decoded.userId, tokenHash)

    const tokens = await this.generateAndStoreTokens(
      decoded.userId,
      decoded.email,
      decoded.role,
      decoded.organization,
      userAgent,
      ip
    )

    return tokens
  }

  async forgotPassword(email: string) {
    const user = await authRepository.findByEmail(email)
    if (!user) {
      logger.info(`Password reset requested for non-existent email: ${email}`)
      return { message: "If an account exists with this email, a code is on its way" }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpHash = await bcrypt.hash(otp, 8)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    await authRepository.setOTP(user.email, otpHash, otpExpiry)

    emailService.sendOTPEmail(user.email, otp, user.name).catch((err) =>
      logger.error("Failed to send OTP email:", err)
    )

    return { message: "If an account exists with this email, a code is on its way" }
  }

  async verifyOtp(email: string, otp: string) {
    const user = await authRepository.findByEmailWithOTP(email)
    if (!user) {
      throw AppError.badRequest("No account found with this email")
    }

    if (!user.passwordResetOTP || !user.passwordResetOTPExpiry) {
      throw AppError.badRequest("No verification code pending. Please request a new one.")
    }

    if (new Date() > user.passwordResetOTPExpiry) {
      throw AppError.badRequest("Verification code has expired. Please request a new one.")
    }

    if (user.otpAttempts >= 5) {
      throw AppError.tooManyRequests("Too many attempts. Please request a new code.")
    }

    const isValid = await bcrypt.compare(otp, user.passwordResetOTP)
    if (!isValid) {
      const attempts = await authRepository.incrementOTPAttempts(user._id.toString())
      const remaining = Math.max(0, 5 - attempts)
      throw AppError.badRequest(`Incorrect code. ${remaining} attempts remaining.`, "OTP_INVALID")
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    const tokenHash = hashToken(resetToken)
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000)

    await authRepository.setResetTokenHash(user._id.toString(), tokenHash, tokenExpiry)

    return { success: true, resetToken }
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = hashToken(token)
    const user = await authRepository.findUserByResetToken(tokenHash)

    if (!user) {
      throw AppError.badRequest("Invalid or expired password reset token")
    }

    if (newPassword.length < 8) {
      throw AppError.badRequest("Password must be at least 8 characters")
    }

    user.password = newPassword
    await user.save()

    await authRepository.clearPasswordResetToken(user._id.toString())
    await authRepository.removeAllRefreshTokens(user.id)

    return { message: "Password reset successful. Please log in with your new password." }
  }

  private async generateAndStoreTokens(
    userId: string,
    email: string,
    role: string,
    organization: string,
    userAgent?: string,
    ip?: string
  ) {
    const payload: JwtPayload = { userId, email, role, organization }

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    })

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    })

    const tokenHash = hashToken(refreshToken)
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS)
    await authRepository.addRefreshToken(userId, tokenHash, expiresAt, userAgent, ip)

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    }
  }

  private sanitizeUser(user: IUser) {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      username: user.username,
      status: user.status,
      role: user.role,
      organization: user.organization,
      onboardingComplete: user.onboardingComplete,
      connectedIntegrations: user.connectedIntegrations,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}

export const authService = new AuthService()
