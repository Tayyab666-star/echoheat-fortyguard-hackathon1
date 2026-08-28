import axios from "axios"
import crypto from "crypto"
import { env } from "../../../config/env.js"
import { logger } from "../../../config/logger.js"
import { integrationsRepository } from "../repositories/integrations.repository.js"

// ── Types ───────────────────────────────────────────────────

export interface ProcoreDailyLog {
  id: string
  projectId: string
  date: string
  weather: string
  temperature: number
  notes: string
  createdBy: string
}

export interface ProcoreProject {
  id: string
  name: string
  address: string
  projectNumber: string
  status: string
  workerCount: number
}

// ── Mock data generators ────────────────────────────────────

function generateMockDailyLog(projectId: string): ProcoreDailyLog {
  return {
    id: `LOG-${Date.now()}`,
    projectId,
    date: new Date().toISOString().split("T")[0] ?? "",
    weather: "Hot, clear",
    temperature: 38 + Math.round(Math.random() * 6),
    notes: "Auto-generated EchoHeat compliance log",
    createdBy: "echoheat-system",
  }
}

function generateMockProject(projectId: string): ProcoreProject {
  return {
    id: projectId,
    name: `Project ${projectId}`,
    address: "Dubai Industrial Zone, UAE",
    projectNumber: `PRJ-${projectId}`,
    status: "active",
    workerCount: 45 + Math.round(Math.random() * 30),
  }
}

// ── Procore Service ─────────────────────────────────────────

export class ProcoreService {
  private client = axios.create({
    baseURL: "https://api.procore.com/rest/v1.1",
    timeout: 10000,
  })

  private async getAccessToken(orgId: string): Promise<string | null> {
    const token = await integrationsRepository.findToken(orgId, "procore")
    if (!token) return null
    if (token.expiresAt && new Date(token.expiresAt) < new Date()) {
      logger.warn(`Procore token expired for org ${orgId}`)
      return null
    }
    return token.accessToken
  }

  getAuthUrl(orgId: string): string {
    const state = crypto.createHash("sha256").update(`${orgId}:${Date.now()}`).digest("hex")
    const params = new URLSearchParams({
      client_id: env.PROCORE_CLIENT_ID ?? "",
      redirect_uri: env.PROCORE_REDIRECT_URI,
      response_type: "code",
      state,
      scope: "project_management core",
    })
    return `${env.PROCORE_AUTH_URL}/oauth/authorize?${params.toString()}`
  }

  async handleCallback(orgId: string, code: string): Promise<void> {
    logger.info(`[SIMULATED] Procore OAuth callback: org=${orgId} code=${code.slice(0, 8)}...`)

    const mockToken = `procore_mock_${crypto.randomBytes(16).toString("hex")}`
    const expiresAt = new Date(Date.now() + 3600 * 1000)

    await integrationsRepository.upsertToken(orgId, "procore", {
      accessToken: mockToken,
      expiresAt,
      scope: ["project_management", "core"],
    })

    logger.info(`Procore connected for org ${orgId} (simulated)`)
  }

  async createDailyLogEntry(
    orgId: string,
    projectId: string,
    logData: { weather: string; temperature: number; notes: string }
  ): Promise<ProcoreDailyLog> {
    const accessToken = await this.getAccessToken(orgId)

    if (!accessToken) {
      logger.info(`[SIMULATED] Procore daily log: project=${projectId}`)
      return generateMockDailyLog(projectId)
    }

    try {
      const response = await this.client.post(
        `/projects/${projectId}/daily_logs`,
        {
          date: new Date().toISOString().split("T")[0],
          weather: logData.weather,
          temperature: logData.temperature,
          notes: logData.notes,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      logger.info(`Procore daily log created: project=${projectId}`)
      return response.data as ProcoreDailyLog
    } catch (error) {
      logger.error(`Procore daily log error for ${projectId}:`, error)
      return generateMockDailyLog(projectId)
    }
  }

  async getProjectInfo(orgId: string, projectId: string): Promise<ProcoreProject> {
    const accessToken = await this.getAccessToken(orgId)

    if (!accessToken) {
      return generateMockProject(projectId)
    }

    try {
      const response = await this.client.get(`/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      return response.data as ProcoreProject
    } catch (error) {
      logger.error(`Procore project info error for ${projectId}:`, error)
      return generateMockProject(projectId)
    }
  }

  async connect(orgId: string, data: { accessToken: string; refreshToken?: string; expiresAt?: string; scope?: string[] }): Promise<void> {
    await integrationsRepository.upsertToken(orgId, "procore", {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      scope: data.scope,
    })
    logger.info(`Procore connected for org ${orgId}`)
  }

  async disconnect(orgId: string): Promise<void> {
    await integrationsRepository.removeToken(orgId, "procore")
    logger.info(`Procore disconnected for org ${orgId}`)
  }

  async getStatus(orgId: string): Promise<{ connected: boolean; provider: string; authUrl?: string }> {
    const connected = await integrationsRepository.isConnected(orgId, "procore")
    const result: { connected: boolean; provider: string; authUrl?: string } = { connected, provider: "procore" }
    if (!connected) {
      result.authUrl = this.getAuthUrl(orgId)
    }
    return result
  }
}

export const procoreService = new ProcoreService()
