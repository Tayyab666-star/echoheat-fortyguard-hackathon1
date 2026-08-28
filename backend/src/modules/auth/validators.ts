import { z } from "zod"

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please provide a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name cannot exceed 100 characters")
      .trim(),
    role: z
      .enum(["admin", "fleet_manager", "safety_director", "facility_manager"], {
        errorMap: () => ({
          message: "Role must be admin, fleet_manager, safety_director, or facility_manager",
        }),
      })
      .optional()
      .default("fleet_manager"),
    organization: z
      .string()
      .min(1, "Organization is required")
      .max(200, "Organization cannot exceed 200 characters")
      .trim(),
  })
  .strict()

export const loginSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please provide a valid email address"),
    password: z
      .string()
      .min(1, "Password is required"),
  })
  .strict()

export const forgotPasswordSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please provide a valid email address"),
  })
  .strict()

export const verifyOtpSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please provide a valid email address"),
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only numbers"),
  })
  .strict()

export const resetPasswordSchema = z
  .object({
    resetToken: z
      .string()
      .min(1, "Reset token is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .strict()

export const updateMeSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name cannot be empty")
      .max(100, "Name cannot exceed 100 characters")
      .trim()
      .optional(),
    organization: z
      .string()
      .min(1, "Organization cannot be empty")
      .max(200, "Organization cannot exceed 200 characters")
      .trim()
      .optional(),
    onboardingComplete: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  })

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdateMeInput = z.infer<typeof updateMeSchema>
