import { Router } from "express"
import {
  createAsset,
  listAssets,
  getAsset,
  updateAsset,
  deleteAsset,
  getAssetStatus,
  getAssetHistory,
} from "../controllers/assets.controller.js"
import { authenticate } from "../../../middleware/authenticate.js"

const router = Router()

router.use(authenticate)

router.post("/", createAsset)
router.get("/", listAssets)
router.get("/:id", getAsset)
router.patch("/:id", updateAsset)
router.delete("/:id", deleteAsset)
router.get("/:id/status", getAssetStatus)
router.get("/:id/history", getAssetHistory)

export default router
