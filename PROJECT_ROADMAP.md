# PROJECT_ROADMAP.md — The GPS

> This file tracks all project phases, current status, and next milestones.
> Update at the end of every session to reflect completed work.

---

## Phase Overview

| # | Phase | Status | Description |
|---|-------|--------|-------------|
| 1 | Core Build | ✅ Complete | Dashboard UI, theme system, 10 themes, fluid typography, responsive layout |
| 2 | Authentication | ✅ Complete | NextAuth v4, Google OAuth + Credentials, signup, login, session management |
| 3 | Vercel Deployment | 🔴 **ACTIVE** | Fix monorepo build, environment variables, Google OAuth on production |
| 4 | Google OAuth Setup | ⏳ Pending | Create Google Cloud project, configure OAuth credentials, test flow |
| 5 | Production Hardening | ⏳ Pending | Backend Railway deploy, NEXTAUTH_URL, BACKEND_URL, error monitoring |
| 6 | Launch | ⏳ Pending | Final testing, domain setup, performance optimization |

---

## 🔴 Active Phase: Vercel Deployment (Phase 3)

### Objective
Get the Next.js frontend deployed and fully functional on Vercel with working authentication.

### Current Blockers

| # | Issue | Severity | Status | Fix Required |
|---|-------|----------|--------|--------------|
| 1 | Vercel build fails — framework detection | 🔴 Critical | **BLOCKING** | Simplify `vercel.json` to `{"framework": "nextjs"}` (Root Dir = `frontend`) |
| 2 | Environment variables not on Vercel | 🔴 Critical | Pending | Add NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_ID/SECRET, BACKEND_URL to Vercel env vars |
| 3 | NEXTAUTH_URL = localhost:3000 | 🔴 Critical | Pending | Set to `https://echoheat.vercel.app` in Vercel env vars |
| 4 | BACKEND_URL = localhost:4000 | 🟡 High | Pending | Set to Railway backend URL in Vercel env vars |
| 5 | Google OAuth credentials = placeholder | 🟡 High | Pending | Create real Google OAuth credentials + add to Vercel env vars |
| 6 | Duplicate `frontend/shared/types/` | 🟢 Low | Pending | Delete redundant copy; `@shared/*` alias already points to root `shared/` |

### Immediate Deliverables

1. Fix `vercel.json` — simplify to `{"framework": "nextjs"}`
2. Add all environment variables to Vercel dashboard
3. Create Google Cloud Console project + OAuth credentials
4. Configure Google OAuth redirect URIs
5. Verify Vercel build succeeds
6. Verify Google login works on production

### Scoping Boundaries

- **IN SCOPE**: Vercel deployment, env vars, Google OAuth, production auth flow
- **OUT OF SCOPE**: Backend Railway deploy (Phase 5), database setup, CI/CD, monitoring

---

## Future Phases

### Phase 4: Google OAuth Setup ⏳

- [ ] Create Google Cloud Console project
- [ ] Enable Google+ API / People API
- [ ] Create OAuth 2.0 Client ID (Web application)
- [ ] Add authorized redirect URIs:
  - `https://echoheat.vercel.app/api/auth/callback/google`
  - `http://localhost:3000/api/auth/callback/google`
- [ ] Copy Client ID + Secret to Vercel env vars
- [ ] Test Google login flow locally and on Vercel

### Phase 5: Production Hardening ⏳

- [ ] Deploy backend to Railway
- [ ] Configure MongoDB Atlas (or Railway add-on)
- [ ] Configure Redis (or Railway add-on)
- [ ] Set all backend environment variables
- [ ] Update CORS origins for production
- [ ] Configure email service (SMTP/nodemailer) for OTP/notifications
- [ ] Add error monitoring (Sentry or similar)
- [ ] Remove `typescript: { ignoreBuildErrors: true }` from next.config.ts
- [ ] Remove `eslint: { ignoreDuringBuilds: true }` from next.config.ts

### Phase 6: Launch ⏳

- [ ] End-to-end testing (all auth flows, dashboard pages)
- [ ] Performance optimization (Lighthouse audit)
- [ ] Custom domain setup
- [ ] SEO meta tags and OG images
- [ ] README.md update with production URLs
- [ ] Demo video / walkthrough

---

## Milestones

| Milestone | Target | Metrics |
|-----------|--------|---------|
| M1: Vercel Build Passes | Now | Build log shows "Build completed" |
| M2: Production Site Loads | Now | `echoheat.vercel.app` shows landing page |
| M3: Google Login Works | Now | User can sign in with Google and reach dashboard |
| M4: Backend Connected | Phase 5 | Dashboard shows real API data |
| M5: Full Stack Live | Phase 5 | All features functional on production URLs |
| M6: Demo Ready | Phase 6 | Hackathon submission complete |

---

## Key Success Metrics

| Metric | Target |
|--------|--------|
| Vercel build success rate | 100% |
| Google OAuth success rate | 100% |
| Page load time (LCP) | < 2.5s |
| First Input Delay | < 100ms |
| Cumulative Layout Shift | < 0.1 |
| Lighthouse score | > 90 |
| TypeScript strict mode | Enabled (remove ignoreBuildErrors) |

---

## Competitive Advantages

| Advantage | Description |
|-----------|-------------|
| 10-theme system | Most hackathon projects have 1 theme; EchoHeat has 10 with full accessibility |
| Real-time thermal monitoring | Socket.io integration for live alert streaming |
| OSHA compliance engine | Automated WBGT monitoring with regulatory compliance logging |
| Fleet pre-cooling | Autonomous vehicle pre-cooling to prevent heat-related cargo damage |
| Monorepo architecture | Clean separation of frontend/backend/database/shared types |
| Production-grade auth | NextAuth v4 with Google OAuth + credentials, JWT strategy |
