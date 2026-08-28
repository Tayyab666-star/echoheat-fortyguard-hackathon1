import { Router } from "express"
import {
  calculateWBGT,
  calculateLiveWBGT,
  calculateThermalLag,
  calculateCargoDecay,
  calculatePeakDemand,
  getROI,
} from "../controllers/thermalEngine.controller.js"
import { authenticate } from "../../../middleware/authenticate.js"
import { thermalEngineLimiter } from "../../../middleware/rateLimiter.js"

const router = Router()

router.use(authenticate)
router.use(thermalEngineLimiter)

router.post("/wbgt", calculateWBGT)
router.post("/wbgt/live", calculateLiveWBGT)
router.post("/lag", calculateThermalLag)
router.post("/cargo-decay", calculateCargoDecay)
router.post("/peak-demand", calculatePeakDemand)
router.get("/roi/:assetId", getROI)

export default router
