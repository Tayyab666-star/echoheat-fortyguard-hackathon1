import dotenv from "dotenv"
import { z } from "zod"
import { logger } from "./logger.js"

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  // ── Required Infrastructure ──────────────────────────────
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  ALLOWED_ORIGINS: z.string().min(1, "ALLOWED_ORIGINS is required (comma-separated)"),
  FORTYGUARD_API_KEY: z.string().min(1, "FORTYGUARD_API_KEY is required"),
  // ── Rate Limiting ────────────────────────────────────────
  RATE_LIMIT_PUBLIC: z.coerce.number().default(100),
  RATE_LIMIT_AUTHENTICATED: z.coerce.number().default(1000),
  RATE_LIMIT_THERMAL_ENGINE: z.coerce.number().default(100),
  RATE_LIMIT_LOGIN: z.coerce.number().default(5),
  // ── Logging ──────────────────────────────────────────────
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),
  // ── Samsara ──────────────────────────────────────────────
  SAMSARA_API_KEY: z.string().optional(),
  SAMSARA_WEBHOOK_SECRET: z.string().optional(),
  SAMSARA_CLIENT_ID: z.string().optional(),
  SAMSARA_CLIENT_SECRET: z.string().optional(),
  SAMSARA_AUTH_URL: z.string().default("https://cloud.samsara.com/connect"),
  // ── Procore ──────────────────────────────────────────────
  PROCORE_API_KEY: z.string().optional(),
  PROCORE_WEBHOOK_SECRET: z.string().optional(),
  PROCORE_CLIENT_ID: z.string().optional(),
  PROCORE_CLIENT_SECRET: z.string().optional(),
  PROCORE_AUTH_URL: z.string().default("https://login.procore.com"),
  PROCORE_REDIRECT_URI: z.string().default("http://localhost:4000/api/v1/integrations/procore/auth-callback"),
  // ── BACnet ───────────────────────────────────────────────
  BACNET_GATEWAY_URL: z.string().optional(),
  // ── FortyGuard Config ────────────────────────────────────
  FORTYGUARD_API_URL: z.string().default("https://api.fortyguard.com/v1"),
  FORTYGUARD_MOCK: z.coerce.boolean().default(true),
  FORTYGUARD_BASE_TEMP: z.coerce.number().default(38),
  FORTYGUARD_HEAT_SPIKE: z.coerce.number().default(6),
  // ── SMTP / Email ────────────────────────────────────────
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  // ── Cache TTLs (seconds) ─────────────────────────────────
  CACHE_TTL_FORTYGUARD: z.coerce.number().default(300),
  CACHE_TTL_KPI: z.coerce.number().default(120),
  CACHE_TTL_ASSET_STATUS: z.coerce.number().default(30),
  CACHE_TTL_ALERT_STATS: z.coerce.number().default(60),
  CACHE_TTL_ANALYTICS_ROI: z.coerce.number().default(600),
  CACHE_WARM_ON_START: z.coerce.boolean().default(true),
})

// ── Validate environment ────────────────────────────────────

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors
  const missing = Object.entries(errors)
    .map(([key, msgs]) => `  ${key}: ${msgs?.join(", ")}`)
    .join("\n")

  console.error("\n╔══════════════════════════════════════════════════╗")
  console.error("║         FATAL: INVALID ENVIRONMENT              ║")
  console.error("╠══════════════════════════════════════════════════╣")
  console.error(`║  Missing or invalid environment variables:      ║`)
  console.error(`${missing}`)
  console.error("╚══════════════════════════════════════════════════╝\n")

  // Fail fast — exit process
  process.exit(1)
}

export const env = parsed.data
export type Env = z.infer<typeof envSchema>
