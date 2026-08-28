import type { Connection } from "mongoose"

// ── Migration interface ──────────────────────────────────────

export interface MigrationFile {
  name: string
  up: (connection: Connection) => Promise<void>
  down: (connection: Connection) => Promise<void>
}
