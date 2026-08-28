import { IntegrationToken, type IIntegrationToken } from "../IntegrationToken.model.js"

export class IntegrationsRepository {
  async findToken(orgId: string, provider: IIntegrationToken["provider"]): Promise<IIntegrationToken | null> {
    return IntegrationToken.findOne({ organization: orgId, provider })
  }

  async upsertToken(
    orgId: string,
    provider: IIntegrationToken["provider"],
    data: {
      accessToken: string
      refreshToken?: string
      expiresAt?: Date
      scope?: string[]
      meta?: Record<string, unknown>
    }
  ): Promise<IIntegrationToken> {
    return IntegrationToken.findOneAndUpdate(
      { organization: orgId, provider },
      { $set: { ...data, organization: orgId, provider } },
      { new: true, upsert: true }
    )
  }

  async removeToken(orgId: string, provider: IIntegrationToken["provider"]): Promise<void> {
    await IntegrationToken.deleteOne({ organization: orgId, provider })
  }

  async isConnected(orgId: string, provider: IIntegrationToken["provider"]): Promise<boolean> {
    const token = await IntegrationToken.findOne({ organization: orgId, provider }).select("accessToken expiresAt")
    if (!token) return false
    if (token.expiresAt && new Date(token.expiresAt) < new Date()) return false
    return true
  }
}

export const integrationsRepository = new IntegrationsRepository()
