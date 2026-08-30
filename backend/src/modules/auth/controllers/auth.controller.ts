// backend/src/modules/auth/controllers/auth.controller.ts
import type { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { sendSuccess } from "../../../utils/response";
import { asyncCatch } from "../../../utils/asyncCatch";
import { validate } from "../../../utils/validators";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  updateMeSchema,
} from "../validators";
import { AppError } from "../../../utils/AppError";

export const register = asyncCatch(async (req: Request, res: Response) => {
  const body: any = validate(registerSchema, req.body);
  const result = await authService.register(body);
  sendSuccess(res, result, "Registration successful", 201);
});

export const login = asyncCatch(async (req: Request, res: Response) => {
  const body: any = validate(loginSchema, req.body);
  const userAgent = req.headers["user-agent"];
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.ip;
  const result = await authService.login(
    body.email,
    body.password,
    userAgent,
    ip
  );
  sendSuccess(res, result, "Login successful");
});

export const logout = asyncCatch(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  const result = await authService.logout(req.user!.userId, refreshToken);
  sendSuccess(res, result);
});

export const logoutAll = asyncCatch(async (req: Request, res: Response) => {
  const result = await authService.logoutAll(req.user!.userId);
  sendSuccess(res, result);
});

export const getMe = asyncCatch(async (req: Request, res: Response) => {
  const result = await authService.getMe(req.user!.userId);
  sendSuccess(res, result);
});

export const updateMe = asyncCatch(async (req: Request, res: Response) => {
  const body: any = validate(updateMeSchema, req.body);
  const result = await authService.updateMe(req.user!.userId, body);
  sendSuccess(res, result, "Profile updated");
});

export const refreshToken = asyncCatch(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body as { refreshToken: string };
  if (!token) {
    sendSuccess(res, null, "Refresh token is required", 400);
    return;
  }
  const userAgent = req.headers["user-agent"];
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.ip;
  const result = await authService.refreshTokens(token, userAgent, ip);
  sendSuccess(res, result, "Token refreshed");
});

export const forgotPassword = asyncCatch(async (req: Request, res: Response) => {
  const body: any = validate(forgotPasswordSchema, req.body);
  const result = await authService.forgotPassword(body.email);
  sendSuccess(res, result);
});

export const verifyOtp = asyncCatch(async (req: Request, res: Response) => {
  const body: any = validate(verifyOtpSchema, req.body);
  const result = await authService.verifyOtp(body.email, body.otp);
  sendSuccess(res, result, "OTP verified successfully");
});

export const resetPassword = asyncCatch(async (req: Request, res: Response) => {
  const body: any = validate(resetPasswordSchema, req.body);
  const result = await authService.resetPassword(
    body.resetToken,
    body.newPassword
  );
  sendSuccess(res, result);
});

export const checkUsername = asyncCatch(async (req: Request, res: Response) => {
  const { username } = req.query as { username: string };
  if (!username || username.length < 3) {
    throw AppError.badRequest("Username must be at least 3 characters");
  }
  const result = await authService.checkUsername(username);
  sendSuccess(res, result);
});

export const verifyEmail = asyncCatch(async (req: Request, res: Response) => {
  const { token } = req.query as { token: string };
  if (!token) {
    throw AppError.badRequest("Verification token is required");
  }
  const result = await authService.verifyEmail(token);
  sendSuccess(res, result);
});

export const resendVerification = asyncCatch(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  if (!email) {
    throw AppError.badRequest("Email is required");
  }
  const result = await authService.resendVerification(email);
  sendSuccess(res, result);
});
