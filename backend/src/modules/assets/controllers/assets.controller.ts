import type { Request, Response } from "express"
import { assetsService } from "../services/assets.service.js"
import { sendSuccess } from "../../../utils/response.js"
import { asyncCatch } from "../../../utils/asyncCatch.js"
import { validate } from "../../../utils/validators.js"
import { createAssetSchema, updateAssetSchema, listAssetsSchema, assetHistorySchema } from "../validators.js"

export const createAsset = asyncCatch(async (req: Request, res: Response) => {
  const body = validate(createAssetSchema, req.body)
  const result = await assetsService.createAsset(body, req.user!.organization, req.user!.userId)
  sendSuccess(res, result, "Asset created", 201)
})

export const listAssets = asyncCatch(async (req: Request, res: Response) => {
  const query = validate(listAssetsSchema, req.query)
  const result = await assetsService.listAssets(query, req.user!.organization)
  sendSuccess(res, result)
})

export const getAsset = asyncCatch(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const result = await assetsService.getAsset(id)
  sendSuccess(res, result)
})

export const updateAsset = asyncCatch(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const body = validate(updateAssetSchema, req.body)
  const result = await assetsService.updateAsset(id, body)
  sendSuccess(res, result, "Asset updated")
})

export const deleteAsset = asyncCatch(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const result = await assetsService.deleteAsset(id)
  sendSuccess(res, result)
})

export const getAssetStatus = asyncCatch(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const result = await assetsService.getAssetStatus(id)
  sendSuccess(res, result)
})

export const getAssetHistory = asyncCatch(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const query = validate(assetHistorySchema, req.query)
  const result = await assetsService.getAssetHistory(id, query)
  sendSuccess(res, result)
})
