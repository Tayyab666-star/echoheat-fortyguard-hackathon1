import type { Request, Response } from "express"
import { authService } from "../services/auth.service.js"
import { emailService } from "../../../utils/email.service.js"
import { sendSuccess } from "../../../utils/response.js"
import { asyncCatch } from "../../../utils/asyncCatch.js"
import { validate } from "../../../utils/validators.js"
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  updateMeSchema,
} from "../validators.js"

export const register = asyncCatch(async (req: Request, res: Response) => {
  const body = validate(registerSchema, req.body)
  const result = await authService.register(body)
  sendSuccess(res, result, "Registration successful", 201)
})

export const login = asyncCatch(async (req: Request, res: Response) => {
  const body = validate(loginSchema, req.body)
  const userAgent = req.headers["user-agent"]
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip
  const result = await authService.login(body.email, body.password, userAgent, ip)

  const time = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  const rawIP = ip || "unknown"
  const device = userAgent || "Unknown device"

  emailService.sendLoginNotificationEmail(result.user.email, result.user.name, {
    time,
    location: "Unknown location",
    device,
    ip: rawIP,
  }).catch(() => {})

  sendSuccess(res, result, "Login successful")
})

export const logout = asyncCatch(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string }
  const result = await authService.logout(req.user!.userId, refreshToken)
  sendSuccess(res, result)
})

export const logoutAll = asyncCatch(async (req: Request, res: Response) => {
  const result = await authService.logoutAll(req.user!.userId)
  sendSuccess(res, result)
})

export const getMe = asyncCatch(async (req: Request, res: Response) => {
  const result = await authService.getMe(req.user!.userId)
  sendSuccess(res, result)
})

export const updateMe = asyncCatch(async (req: Request, res: Response) => {
  const body = validate(updateMeSchema, req.body)
  const result = await authService.updateMe(req.user!.userId, body)
  sendSuccess(res, result, "Profile updated")
})

export const refreshToken = asyncCatch(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body as { refreshToken: string }
  if (!token) {
    sendSuccess(res, null, "Refresh token is required", 400)
    return
  }
  const userAgent = req.headers["user-agent"]
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip
  const result = await authService.refreshTokens(token, userAgent, ip)
  sendSuccess(res, result, "Token refreshed")
})

export const forgotPassword = asyncCatch(async (req: Request, res: Response) => {
  const body = validate(forgotPasswordSchema, req.body)
  const result = await authService.forgotPassword(body.email)
  sendSuccess(res, result)
})

export const verifyOtp = asyncCatch(async (req: Request, res: Response) => {
  const body = validate(verifyOtpSchema, req.body)
  const result = await authService.verifyOtp(body.email, body.otp)
  sendSuccess(res, result, "OTP verified successfully")
})

export const resetPassword = asyncCatch(async (req: Request, res: Response) => {
  const body = validate(resetPasswordSchema, req.body)
  const result = await authService.resetPassword(body.resetToken, body.newPassword)
  sendSuccess(res, result)
})
