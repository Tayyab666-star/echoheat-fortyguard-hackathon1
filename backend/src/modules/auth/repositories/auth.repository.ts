import { User, type IUser, type IRefreshToken } from "../User.model.js"
import { AppError } from "../../../utils/AppError.js"

export class AuthRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select("+password +refreshTokens")
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id)
  }

  async findByIdWithRefreshTokens(id: string): Promise<IUser | null> {
    return User.findById(id).select("+refreshTokens")
  }

  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return User.findById(id).select("+password")
  }

  async findByIdWithResetToken(id: string): Promise<IUser | null> {
    return User.findById(id).select("+passwordResetToken +passwordResetExpires")
  }

  async create(data: {
    email: string
    password: string
    name: string
    role?: string
    organization: string
  }): Promise<IUser> {
    const existing = await User.findOne({ email: data.email })
    if (existing) {
      throw AppError.conflict("An account with this email already exists")
    }
    return User.create(data)
  }

  async addRefreshToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    userAgent?: string,
    ip?: string
  ): Promise<void> {
    const user = await User.findById(userId).select("+refreshTokens")
    if (!user) throw AppError.notFound("User not found")
    user.refreshTokens.push({ token: tokenHash, createdAt: new Date(), expiresAt, userAgent, ip } as IRefreshToken)
    await user.save()
  }

  async removeRefreshToken(userId: string, tokenHash: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: { token: tokenHash } },
    })
  }

  async removeAllRefreshTokens(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $set: { refreshTokens: [] } })
  }

  async removeOtherRefreshTokens(userId: string, currentTokenHash: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: { token: { $ne: currentTokenHash } } },
    })
  }

  async findUserByRefreshToken(tokenHash: string): Promise<IUser | null> {
    return User.findOne({ "refreshTokens.token": tokenHash }).select("+refreshTokens")
  }

  async setEmailVerificationToken(email: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await User.findOneAndUpdate(
      { email },
      { $set: { passwordResetToken: tokenHash, passwordResetExpires: expiresAt } }
    )
  }

  async findUserByResetToken(tokenHash: string): Promise<IUser | null> {
    return User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetTokenHashExpiry: { $gt: new Date() },
    }).select("+password +passwordResetTokenHash +passwordResetTokenHashExpiry")
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $unset: {
        passwordResetTokenHash: 1,
        passwordResetTokenHashExpiry: 1,
        passwordResetOTP: 1,
        passwordResetOTPExpiry: 1,
        otpAttempts: 1,
      },
    })
  }

  async setOTP(email: string, otpHash: string, expiresAt: Date): Promise<void> {
    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          passwordResetOTP: otpHash,
          passwordResetOTPExpiry: expiresAt,
          otpAttempts: 0,
        },
      }
    )
  }

  async findByEmailWithOTP(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select("+password +passwordResetOTP +passwordResetOTPExpiry +otpAttempts")
  }

  async incrementOTPAttempts(userId: string): Promise<number> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { otpAttempts: 1 } },
      { new: true }
    ).select("+otpAttempts")
    return user?.otpAttempts ?? 0
  }

  async setResetTokenHash(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $set: {
        passwordResetTokenHash: tokenHash,
        passwordResetTokenHashExpiry: expiresAt,
      },
      $unset: {
        passwordResetOTP: 1,
        passwordResetOTPExpiry: 1,
        otpAttempts: 1,
      },
    })
  }

  async updateProfile(
    userId: string,
    data: { name?: string; organization?: string; onboardingComplete?: boolean }
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true })
  }

  async updateIntegration(
    userId: string,
    integration: "samsara" | "procore" | "bacnet",
    connected: boolean
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      userId,
      { $set: { [`connectedIntegrations.${integration}`]: connected } },
      { new: true }
    )
  }
}

export const authRepository = new AuthRepository()
