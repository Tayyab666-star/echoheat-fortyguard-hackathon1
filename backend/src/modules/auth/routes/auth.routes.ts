import { Router } from "express"
import {
  register,
  login,
  logout,
  logoutAll,
  getMe,
  updateMe,
  refreshToken,
  forgotPassword,
  verifyOtp,
  resetPassword,
  checkUsername,
  verifyEmail,
  resendVerification,
} from "../controllers/auth.controller.js"
import { authenticate } from "../../../middleware/authenticate.js"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/refresh", refreshToken)
router.post("/forgot-password", forgotPassword)
router.post("/verify-otp", verifyOtp)
router.post("/reset-password", resetPassword)
router.get("/check-username", checkUsername)
router.get("/verify-email", verifyEmail)
router.post("/resend-verification", resendVerification)

router.post("/logout", authenticate, logout)
router.post("/logout-all", authenticate, logoutAll)
router.get("/me", authenticate, getMe)
router.patch("/me", authenticate, updateMe)

export default router
