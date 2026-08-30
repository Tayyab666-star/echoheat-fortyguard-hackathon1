// backend/src/routes/alerts.ts
import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    alerts: [
      {
        id: "alert_01",
        asset_id: "FLEET-TRUCK-104",
        severity: "HIGH",
        message: "45.2°C Asphalt heat spike detected along route",
        timestamp: new Date().toISOString(),
      },
      {
        id: "alert_02",
        asset_id: "SITE-CONSTRUCT-09",
        severity: "CRITICAL",
        message: "Micro-WBGT breached 33.2°C threshold",
        timestamp: new Date().toISOString(),
      },
    ],
  });
});

export default router;
