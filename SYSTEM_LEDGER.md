# SYSTEM_LEDGER.md — The Memory

> This file is the project's memory. Update it at the end of every session.
> Any AI agent can read this file to instantly recover the exact project state.

---

## Current State

| Metric | Value |
|--------|-------|
| **Active Phase** | Phase 3: Vercel Deployment 🔴 |
| **Total Files (frontend)** | ~85 (components, hooks, lib, app routes) |
| **Total Files (backend)** | ~40 (modules, middleware, config, utils) |
| **Total Files (database)** | ~15 (models, interfaces, seeds, migrations) |
| **Total Files (shared)** | 1 (types/index.ts — 212 lines) |
| **Build Status** | 🔴 Failing (Vercel framework detection) |
| **Last Git Commit** | `83a4681` — fix(vercel): force framework nextjs with explicit monorepo build commands |
| **Git Branch** | `main` |
| **Frontend Deploy** | Vercel (build failing) |
| **Backend Deploy** | Not deployed yet |
| **Database** | Local Docker Compose only |
| **Auth Status** | Credentials login works locally; Google OAuth broken (no real credentials) |

---

## File Ledger

### Created Files (Chronological)

| # | File | Created | Purpose |
|---|------|---------|---------|
| 1 | `frontend/app/layout.tsx` | Initial build | Root layout with theme init script |
| 2 | `frontend/app/page.tsx` | Initial build | Root page with session redirect |
| 3 | `frontend/app/globals.css` | Initial build | 614-line theme system, 10 themes, tokens |
| 4 | `frontend/components/Providers.tsx` | Initial build | SessionProvider + ThemeProvider + ToastProvider wrapper |
| 5 | `frontend/lib/theme/config.ts` | Initial build | Theme definitions (10 themes) |
| 6 | `frontend/lib/theme/provider.tsx` | Initial build | ThemeProvider with localStorage persistence |
| 7 | `frontend/lib/theme/colors.ts` | Initial build | Theme color hooks |
| 8 | `frontend/lib/utils.ts` | Initial build | `cn()` utility (clsx + tailwind-merge) |
| 9 | `frontend/lib/fonts.ts` | Initial build | GeistSans + GeistMono font loading |
| 10 | `frontend/lib/api/client.ts` | Initial build | Typed `fetchAPI()` wrapper |
| 11 | `frontend/hooks/useSession.ts` | Initial build | Custom session hook (fetches /api/auth/session) |
| 12 | `frontend/hooks/useChartDimensions.ts` | Initial build | Chart container dimensions |
| 13 | `frontend/hooks/useThemeShortcut.ts` | Initial build | Ctrl+Shift+T/L keyboard shortcuts |
| 14 | `frontend/lib/toast/provider.tsx` | Initial build | Toast notification system |
| 15 | `frontend/components/layout/DashboardLayout.tsx` | Initial build | Main dashboard layout orchestrator |
| 16 | `frontend/components/layout/Topbar.tsx` | Initial build | Desktop top bar with notifications + avatar |
| 17 | `frontend/components/layout/Sidebar.tsx` | Initial build | Desktop sidebar navigation |
| 18 | `frontend/components/layout/MobileHeader.tsx` | Initial build | Mobile header with hamburger |
| 19 | `frontend/components/layout/MobileDrawer.tsx` | Initial build | Mobile slide-out drawer |
| 20 | `frontend/components/layout/MobileBottomNav.tsx` | Initial build | Mobile bottom navigation bar |
| 21 | `frontend/components/layout/PageTransition.tsx` | Initial build | Framer Motion page transitions |
| 22 | `frontend/components/layout/EchoHeatSplashLoader.tsx` | Feature | Logo click splash loader |
| 23 | `frontend/components/layout/InitialLoadingScreen.tsx` | Feature | First-visit loading screen |
| 24 | `frontend/components/auth/LoadingScreen.tsx` | Feature | Post-login loading animation (5s) |
| 25 | `frontend/components/ui/` (17 files) | Initial build | shadcn/ui components (New York style) |
| 26 | `frontend/components/landing/LandingPage.tsx` | Feature | Public landing page |
| 27 | `frontend/app/(auth)/layout.tsx` | Feature | Auth layout with session redirect |
| 28 | `frontend/app/(auth)/login/page.tsx` | Feature | Login page with Google + credentials |
| 29 | `frontend/app/(auth)/signup/page.tsx` | Feature | Signup with username, email, password, Google |
| 30 | `frontend/app/(auth)/forgot-password/page.tsx` | Feature | Forgot password with OTP |
| 31 | `frontend/app/(auth)/verify-email-sent/page.tsx` | Feature | Email verification pending page |
| 32 | `frontend/app/loading/page.tsx` | Feature | Post-login loading page |
| 33 | `frontend/app/(dashboard)/layout.tsx` | Feature | Dashboard layout wrapper |
| 34 | `frontend/app/(dashboard)/dashboard/page.tsx` | Feature | Dashboard overview page |
| 35 | `frontend/app/(dashboard)/dashboard/alerts/page.tsx` | Feature | Alert feed page |
| 36 | `frontend/app/(dashboard)/dashboard/analytics/page.tsx` | Feature | Analytics page |
| 37 | `frontend/app/(dashboard)/dashboard/fleet/page.tsx` | Feature | Fleet & cold chain page |
| 38 | `frontend/app/(dashboard)/dashboard/hvac/page.tsx` | Feature | Facility HVAC page |
| 39 | `frontend/app/(dashboard)/dashboard/safety/page.tsx` | Feature | Site safety page |
| 40 | `frontend/app/(dashboard)/dashboard/settings/page.tsx` | Feature | Settings page |
| 41 | `frontend/app/api/auth/[...nextauth]/route.ts` | Feature | NextAuth config (Google + Credentials) |
| 42 | `frontend/components/alerts/` | Feature | Alert-related components |
| 43 | `frontend/components/analytics/` | Feature | Analytics charts and widgets |
| 44 | `frontend/components/dashboard/` | Feature | Dashboard card components |
| 45 | `frontend/components/facility/` | Feature | HVAC/Facility components |
| 46 | `frontend/components/fleet/` | Feature | Fleet vehicle components |
| 47 | `frontend/components/safety/` | Feature | Safety compliance components |
| 48 | `frontend/components/settings/` | Feature | Settings page components |
| 49 | `shared/types/index.ts` | Refactor | Shared domain types (212 lines) |
| 50 | `backend/src/app.ts` | Initial build | Express server entry point |
| 51 | `backend/src/config/` | Initial build | db.ts, env.ts, logger.ts, redis.ts |
| 52 | `backend/src/modules/auth/` | Initial build | Auth routes, services, controllers |
| 53 | `backend/src/modules/alerts/` | Initial build | Alert routes and services |
| 54 | `backend/src/modules/analytics/` | Initial build | Analytics routes and services |
| 55 | `backend/src/modules/assets/` | Initial build | Asset routes and services |
| 56 | `backend/src/modules/integrations/` | Initial build | Integration routes and services |
| 57 | `backend/src/modules/thermalEngine/` | Initial build | Thermal engine routes and services |
| 58 | `backend/src/middleware/` | Initial build | Auth, rate limiting, error handling, sanitization |
| 59 | `backend/src/jobs/thermalPoll.job.ts` | Feature | 5-minute thermal polling cron |
| 60 | `database/src/models/` | Initial build | Mongoose models (6 models) |
| 61 | `database/src/interfaces/` | Initial build | TypeScript interfaces |
| 62 | `database/src/seeds/` | Initial build | Seed data files |
| 63 | `database/src/connection.ts` | Initial build | MongoDB connection |
| 64 | `docker-compose.yml` | Initial build | MongoDB + Redis + API |
| 65 | `package.json` | Initial build | Root monorepo orchestrator |
| 66 | `.gitignore` | Initial build | Git ignore rules |
| 67 | `README.md` | Initial build | Default create-next-app README |

### Modified Files (Recent Changes)

| # | File | Commit | Change |
|---|------|--------|--------|
| 1 | `frontend/tsconfig.json` | `16d02ef` | Fixed `@shared/*` path: `./shared/*` → `../shared/*` |
| 2 | `frontend/next.config.ts` | `16d02ef` | Added webpack alias for `@shared` + `outputFileTracingRoots` |
| 3 | `frontend/components/Providers.tsx` | `5bc0081` | Added `SessionProvider` from `next-auth/react` |
| 4 | `frontend/.env.local` | `5bc0081` | Added GOOGLE_CLIENT_ID/SECRET placeholders + NEXT_PUBLIC_API_URL |
| 5 | `frontend/app/(auth)/signup/page.tsx` | `5bc0081` | Fixed Google button callback: `/verify-email-sent` → `/loading?type=signup` |
| 6 | `vercel.json` | `83a4681` | Created with `{"framework": "nextjs", installCommand, buildCommand, outputDirectory}` |

---

## Known Issues & Technical Debt

### 🔴 Critical

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | **Vercel build fails** — `cd frontend: No such file or directory` | `vercel.json` | Cannot deploy to production |
| 2 | **NEXTAUTH_URL = localhost:3000** | `frontend/.env.local` (not on Vercel) | Auth redirects break in production |
| 3 | **BACKEND_URL = localhost:4000** | `frontend/.env.local` (not on Vercel) | Credentials login fails in production |
| 4 | **Google OAuth = placeholder values** | `frontend/.env.local` (not on Vercel) | Google login completely non-functional |

### 🟡 High

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 5 | **No real Google OAuth credentials** | Google Cloud Console | Cannot test Google login at all |
| 6 | **Environment variables not in Vercel** | Vercel dashboard | All auth-related features fail |
| 7 | **Backend not deployed** | Railway | Frontend shows mock/empty data |

### 🟢 Low

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 8 | **Duplicate `frontend/shared/types/`** | `frontend/shared/` | Redundant copy, may drift from root `shared/` |
| 9 | **Default README.md** | Root | Not customized for the project |
| 10 | **No tests** | Entire project | No automated testing |
| 11 | **No CI/CD** | No `.github/workflows/` | No automated builds or deployments |
| 12 | **`typescript: { ignoreBuildErrors: true }`** | `next.config.ts` | Hides type errors in production builds |
| 13 | **`eslint: { ignoreDuringBuilds: true }`** | `next.config.ts` | Hides lint errors in production builds |

---

## Next Actions (Prioritized)

### Immediate (This Session)

1. **Fix `vercel.json`** — Change to `{"framework": "nextjs"}` (Root Directory = `frontend` handles the rest)
2. **Push the fix** — Commit and push updated vercel.json
3. **User: Add Vercel env vars** — NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BACKEND_URL, NEXT_PUBLIC_API_URL
4. **User: Verify Vercel build** — Check deployment logs for success

### Next Session

5. **User: Create Google OAuth credentials** — Google Cloud Console setup
6. **Test Google login on Vercel** — End-to-end flow verification
7. **Deploy backend to Railway** — Dockerfile + env vars
8. **Connect frontend to backend** — Update BACKEND_URL

### Future

9. **Delete `frontend/shared/`** — Remove duplicate types
10. **Add error monitoring** — Sentry or similar
11. **Enable strict TS/ESLint builds** — Remove ignoreBuildErrors
12. **Add automated tests** — Unit + integration tests
13. **Set up CI/CD** — GitHub Actions for automated deployment
