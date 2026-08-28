# AI_CONTEXT.md — The Constitution

> This file is the single source of truth for all AI agents working on this project.
> Read this file at the start of every session. Update it when architecture changes.

---

## Project Identity

| Field | Value |
|-------|-------|
| **Name** | EchoHeat |
| **Subtitle** | FortyGuard Hackathon |
| **Type** | Full-stack web application (monorepo) |
| **Domain** | Industrial thermal safety — WBGT monitoring, OSHA compliance, fleet pre-cooling, facility HVAC orchestration |
| **Core Purpose** | Autonomous Thermal Orchestration Engine with real-time telemetry, anomaly detection, and orchestration control |
| **Status** | Hackathon build — functional prototype |

---

## Tech Stack

### Frontend (`frontend/`)

| Technology | Version | Rationale |
|------------|---------|-----------|
| Next.js | 15.5.23 | App Router, server components, API routes for NextAuth |
| React | 19.1.0 | Latest concurrent features, compatible with Next.js 15 |
| TypeScript | ^5 | Type safety across the entire stack |
| Tailwind CSS | v4 | Utility-first styling, CSS custom property integration |
| Radix UI | ^1.6.7 | Accessible, unstyled primitives (dialog, tooltip, separator, slot) |
| Framer Motion | ^13.1.1 | Page transitions, micro-interactions, loading animations |
| NextAuth | ^4.24.15 | Google OAuth + Credentials provider, JWT session strategy |
| Geist | ^1.7.2 | Monospace + sans-serif font family (Vercel) |
| Lucide React | ^1.33.0 | Icon library |
| class-variance-authority | ^0.7.1 | Component variant management |
| clsx + tailwind-merge | ^2.1.1 / ^3.6.0 | Conditional class merging (`cn()` utility) |

### Backend (`backend/`)

| Technology | Version | Rationale |
|------------|---------|-----------|
| Express | ^4.21.0 | HTTP framework |
| TypeScript | ^5.3.2 | Strict type safety (noUncheckedIndexedAccess, noImplicitReturns) |
| Mongoose | ^8.8.0 | MongoDB ODM with schema validation |
| Redis | ^6.2.1 | Caching, rate limiting, session store |
| Socket.io | ^4.7.2 | Real-time alert streaming |
| JWT (jsonwebtoken) | ^9.0.2 | Access + refresh token authentication |
| bcryptjs | ^2.4.3 | Password hashing |
| Zod | ^3.22.4 | Request validation schemas |
| Helmet | ^7.1.0 | Security headers (CSP, HSTS, XSS) |
| Winston | ^3.11.0 | Structured logging with daily rotation |
| nodemailer | ^6.9.7 | Email sending (OTP, notifications) |
| Puppeteer | ^23.0.0 | Report generation / screenshots |
| node-cron | ^3.0.3 | Scheduled thermal polling (5-min intervals) |
| express-rate-limit + rate-limit-redis | ^7.1.4 / ^4.2.0 | Distributed rate limiting |
| geoip-lite | ^2.0.3 | IP geolocation for request logging |

### Database (`database/`)

| Technology | Version | Rationale |
|------------|---------|-----------|
| Mongoose | ^8.8.0 | Shared schemas/models for MongoDB 7 |
| bcryptjs | ^2.4.3 | Password hashing (shared with backend) |

### Infrastructure

| Component | Technology | Port |
|-----------|------------|------|
| Frontend deploy | Vercel | — |
| Backend deploy | Railway (Dockerfile) | 4000 |
| Database | MongoDB 7 | 27017 |
| Cache | Redis 7 Alpine | 6379 |
| Local dev | Docker Compose | — |

---

## Architecture

### Monorepo Structure (Manual — No Workspaces)

```
/
├── frontend/          # Next.js 15 app (App Router)
│   ├── app/           # Routes: (auth), (dashboard), loading/, onboarding/, api/
│   ├── components/    # UI components organized by domain
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities, API client, theme system, toast system
│   ├── public/        # Static assets
│   └── shared/        # DUPLICATE of root shared/ (redundant, see Known Issues)
├── backend/           # Express.js API server
│   └── src/
│       ├── modules/   # Domain modules: auth, alerts, analytics, assets, integrations, thermalEngine
│       ├── middleware/ # authenticate, authorize, rateLimiter, errorHandler, sanitize
│       ├── config/    # db.ts, env.ts (Zod-validated), logger.ts, redis.ts
│       ├── jobs/      # Scheduled tasks (thermalPoll.job.ts)
│       └── services/  # Shared services
├── database/          # Mongoose schemas, models, seeds, migrations
│   └── src/
│       ├── models/    # Alert, Asset, User, Organization, ThermalReading, AlertAction
│       ├── interfaces/# TypeScript interfaces
│       └── seeds/     # Seed data for development
├── shared/            # Shared TypeScript types (domain types used by frontend + backend)
│   └── types/
│       └── index.ts   # 212 lines — all domain types
└── data-analyst-work/ # Cloned teammate repo (gitignored)
```

### Design Patterns

| Pattern | Where | Description |
|---------|-------|-------------|
| Module Pattern | `backend/src/modules/` | Each domain (auth, alerts, etc.) has routes + services |
| Middleware Chain | `backend/src/middleware/` | authenticate → authorize → rateLimiter → handler |
| Route Groups | `frontend/app/(auth)/`, `frontend/app/(dashboard)/` | Next.js route groups for layout isolation |
| Custom Hooks | `frontend/hooks/` | useSession, useChartDimensions, useThemeShortcut |
| Theme Provider | `frontend/lib/theme/` | 10-theme system with CSS custom properties + Tailwind bridge |
| API Client | `frontend/lib/api/client.ts` | Typed fetchAPI wrapper with error handling |

### File Boundaries

- **NEVER** import from `backend/` directly in `frontend/` code
- **NEVER** import from `frontend/` in `backend/` code
- **ALWAYS** use `@shared/*` for shared types between frontend and backend
- **ALWAYS** use the `fetchAPI()` wrapper in `frontend/lib/api/client.ts` for API calls
- Backend env vars are in `backend/.env` (not committed)
- Frontend env vars are in `frontend/.env.local` (not committed)

---

## Design Tokens

### Typography (Fluid Scale)

| Token | Value | Usage |
|-------|-------|-------|
| `--text-display` | `clamp(2rem, 5vw, 3.5rem)` | Hero/display text |
| `--text-heading1` | `clamp(1.5rem, 3vw, 2.25rem)` | Page titles |
| `--text-heading2` | `clamp(1.25rem, 2vw, 1.5rem)` | Section headings |
| `--text-heading3` | `clamp(1rem, 1.5vw, 1.25rem)` | Card headings |
| `--text-body` | `clamp(0.875rem, 1vw, 1rem)` | Body text |
| `--text-small` | `0.875rem` | Secondary text |
| `--text-xs` | `0.75rem` | Labels, badges |
| `--text-mono` | `clamp(0.75rem, 1vw, 0.875rem)` | Code, data |

### Spacing (8pt Grid)

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |

### Themes (10 total)

| ID | Label | Mode | Accent | CSS Selector |
|----|-------|------|--------|-------------|
| `thermal-dark` | Thermal Dark | dark | `#F97316` | `[data-theme="thermal-dark"]` |
| `arctic-light` | Arctic Light | light | `#0EA5E9` | `[data-theme="arctic-light"]` |
| `midnight-blue` | Midnight Blue | dark | `#3B82F6` | `[data-theme="midnight-blue"]` |
| `forest-ops` | Forest Ops | dark | `#22C55E` | `[data-theme="forest-ops"]` |
| `volcanic-red` | Volcanic Red | dark | `#EF4444` | `[data-theme="volcanic-red"]` |
| `cyber-purple` | Cyber Purple | dark | `#A855F7` | `[data-theme="cyber-purple"]` |
| `amber-warning` | Amber Warning | dark | `#F59E0B` | `[data-theme="amber-warning"]` |
| `rose-gold` | Rose Gold | dark | `#F43F5E` | `[data-theme="rose-gold"]` |
| `slate-pro` | Slate Pro | light | `#6366F1` | `[data-theme="slate-pro"]` |
| `terminal-green` | Terminal Green | dark | `#4ADE80` | `[data-theme="terminal-green"]` |

### Color System

All themes define CSS custom properties:
- `--bg-base`, `--bg-surface-1/2/3` — Background layers
- `--text-primary`, `--text-muted` — Text hierarchy
- `--border-default`, `--border-subtle` — Borders
- `--accent` (mapped to `--color-primary` for Tailwind)
- `--accent-danger`, `--accent-warning`, `--accent-success` — Semantic colors
- `--surface-hover`, `--surface-active` — Interactive states

### Accessibility

- WCAG AA contrast ratios enforced
- `prefers-reduced-motion` support via `.reduce-motion` class
- High contrast mode via `.high-contrast` class
- Font size variants: `.font-size-small`, `.font-size-large`
- 44x44px minimum touch targets on mobile
- Safe area insets for notch devices

---

## Strict Rules

### NEVER (Forbidden)

| Rule | Reason |
|------|--------|
| Import from `backend/` in frontend code | Separation of concerns; backend runs on different server |
| Use `any` type in new code | Type safety; use `unknown` or specific types |
| Commit `.env`, `.env.local`, or secrets | Security; all env files are gitignored |
| Use `window`/`document` in Server Components | Next.js SSR compatibility; only in `"use client"` files |
| Hardcode API URLs | Always use `process.env.NEXT_PUBLIC_API_URL` or `process.env.BACKEND_URL` |
| Skip error handling in `fetchAPI` | All API calls must handle errors gracefully |
| Create new UI components without following `cn()` pattern | Consistent styling via `class-variance-authority` + `clsx` + `tailwind-merge` |
| Add new dependencies without checking existing ones | Check `package.json` first; prefer existing libraries |
| Modify `globals.css` theme definitions without updating all 10 themes | Theme consistency; each theme must define all tokens |
| Use inline styles for new components | Prefer Tailwind utility classes; inline styles only exist in legacy code |
| Build without running `npm run build` first | Verify compilation before committing |

### ALWAYS (Required)

| Rule | Reason |
|------|--------|
| Use `@shared/*` for shared TypeScript types | Single source of truth for domain types |
| Use `fetchAPI()` from `frontend/lib/api/client.ts` | Consistent error handling, type safety, base URL management |
| Use `cn()` from `frontend/lib/utils.ts` for conditional classes | Consistent class merging, Tailwind conflict resolution |
| Wrap `"use client"` components at the top | Required for React hooks in Next.js App Router |
| Use Radix UI primitives for accessible components | Accessibility, keyboard navigation, ARIA compliance |
| Follow module pattern in backend (`routes/` + `services/`) | Consistent code organization |
| Validate all API inputs with Zod schemas | Input validation, type inference, error messages |
| Use `getServerSession(authOptions)` for server-side auth checks | NextAuth server-side session validation |
| Use the custom `useSession()` hook from `frontend/hooks/useSession.ts` | Consistent session management across client components |
| Set `suppressHydrationWarning` on `<html>` and `<body>` | Required for theme initialization script |

---

## Auth Flow

### Credentials Login

```
1. User submits email/password on /login
2. signIn("credentials", { email, password, redirect: false })
3. NextAuth authorize() POSTs to BACKEND_URL/api/v1/auth/login
4. Backend validates credentials against MongoDB (bcryptjs)
5. Backend returns user data + JWT access/refresh tokens
6. NextAuth stores JWT in session cookie
7. Frontend redirects to /loading?type=login
8. After 5s loading animation, redirects to /dashboard
```

### Google OAuth Login

```
1. User clicks "Continue with Google" on /login
2. signIn("google", { callbackUrl: "/loading?type=login" })
3. NextAuth redirects to Google OAuth consent screen
4. Google redirects back to /api/auth/callback/google
5. NextAuth creates/updates session with Google profile
6. User lands on /loading?type=login
7. After 5s loading animation, redirects to /dashboard
```

### Session Management

- **Server-side**: `getServerSession(authOptions)` in layouts and server components
- **Client-side**: Custom `useSession()` hook (fetches `/api/auth/session`)
- **Topbar/Sidebar**: `useSession` from `next-auth/react` (requires `SessionProvider`)
- **Sign out**: `signOut({ callbackUrl: '/' })` or `window.location.href = "/api/auth/signout?callbackUrl=/"`

### Provider Nesting Order

```
SessionProvider > ThemeProvider > ToastProvider > TooltipProvider
```

---

## Deployment Topology

| Service | Platform | Config | URL Pattern |
|---------|----------|--------|-------------|
| Frontend | Vercel | Root Directory: `frontend`, Framework: Next.js | `echoheat.vercel.app` |
| Backend | Railway | Dockerfile, Procfile | `echoheat-api.up.railway.app` |
| Database | MongoDB Atlas / Docker | `docker-compose.yml` | `mongodb://echoheat:...@host:27017/echoheat` |
| Cache | Redis Cloud / Docker | `docker-compose.yml` | `redis://host:6379` |

### Environment Variables (Production)

**Vercel (Frontend):**
- `NEXTAUTH_SECRET` — Random 32+ char string
- `NEXTAUTH_URL` — `https://echoheat.vercel.app`
- `GOOGLE_CLIENT_ID` — Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` — Google OAuth Client Secret
- `BACKEND_URL` — Railway backend URL
- `NEXT_PUBLIC_API_URL` — Same Railway URL (used client-side)

**Railway (Backend):**
- `MONGODB_URI` — MongoDB connection string
- `REDIS_URL` — Redis connection string
- `JWT_SECRET` — JWT signing secret
- `JWT_REFRESH_SECRET` — Refresh token secret
- `ALLOWED_ORIGINS` — Vercel frontend URL
- `FORTYGUARD_API_KEY` — FortyGuard integration key

---

## Model & Tool Strategy

- **Primary model**: Current model (mimo-v2.5-free via OpenCode)
- **Fallback**: N/A — single model
- **Tool boundaries**: Read-only exploration first, then plan, then implement on approval
- **Verification**: Always run `npm run build` after code changes; run `npm run lint` if available

---

## i18n & Localization

- **Language**: English only (en)
- **Text direction**: LTR (left-to-right)
- **Character script**: Latin
- **No i18n framework** currently integrated
- All user-facing strings are hardcoded in English

---

## Session Management & Planning Governance

### Mandatory Planning Governance

**Strict Approval Policy**: NEVER make direct file edits, write code, or execute mutating commands without presenting a complete, detailed implementation plan and receiving explicit user approval first.

### Session Boot Sequences

**Full Boot (Session Start):**
> Read AI_CONTEXT.md, PROJECT_ROADMAP.md, and SYSTEM_LEDGER.md. Confirm you understand the architecture, strict rules, and active phase before we begin working.

**Quick Boot (Context Refresh):**
> Read AI_CONTEXT.md and SYSTEM_LEDGER.md, then resume work from where we left off.

### Session Close-Out Procedure

**Close-Out (Session End):**
> Update PROJECT_ROADMAP.md and SYSTEM_LEDGER.md to reflect all completed tasks, new files created, and updated system metrics before wrapping up.

---

## Global Authenticity Rule

All technical claims must be verifiable. All statistics must cite valid sources. No hallucinated APIs, no dummy fallbacks, no fabricated library methods. If uncertain, say "I need to verify this" rather than guessing.
