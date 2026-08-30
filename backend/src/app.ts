// backend/src/app.ts
import express, { Request, Response } from "express";
import cors from "cors";
import alertsRouter from "./routes/alerts";
import orchestrateRouter from "./routes/orchestrate";

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Health check endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "online",
    service: "EchoHeat Orchestration API",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/v1/alerts", alertsRouter);
app.use("/api/v1/orchestrate", orchestrateRouter);

const PORT = process.env.PORT || 8000;
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`[ECHOHEAT BACKEND] Server running on port ${PORT}`);
});

export default app;
