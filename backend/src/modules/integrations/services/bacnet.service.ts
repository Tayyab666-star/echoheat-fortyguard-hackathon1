import axios from "axios"
import { env } from "../../../config/env.js"
import { logger } from "../../../config/logger.js"

export class BACnetService {
  private client = axios.create({
    baseURL: env.BACNET_GATEWAY_URL ?? "http://localhost:5000",
    timeout: 10000,
  })

  async readPoint(deviceId: string, pointId: string) {
    try {
      const response = await this.client.get(`/devices/${deviceId}/points/${pointId}`)
      return response.data
    } catch (error) {
      logger.error("BACnet read error:", error)
      throw error
    }
  }

  async writePoint(deviceId: string, pointId: string, value: number | boolean) {
    try {
      const response = await this.client.post(`/devices/${deviceId}/points/${pointId}`, { value })
      return response.data
    } catch (error) {
      logger.error("BACnet write error:", error)
      throw error
    }
  }
}

export const bacnetService = new BACnetService()
