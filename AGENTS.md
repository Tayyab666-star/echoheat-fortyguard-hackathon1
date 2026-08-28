# AGENTS.md — AI Agent Rules for EchoHeat

> This file defines rules that ALL AI agents must follow when working on this project.
> Read AI_CONTEXT.md, PROJECT_ROADMAP.md, and SYSTEM_LEDGER.md before starting work.

---

## 1. Authenticity

All technical facts, citations, statistics, and API contracts must be verifiable. Unverified or hallucinated code/data is strictly prohibited. If uncertain, say "I need to verify this" rather than guessing.

---

## 2. Planning Governance

**Strict Approval Policy**: Always present a complete, detailed implementation plan and wait for explicit user approval before modifying files or executing structural changes.

### Before Any Code Change:
1. Read `AI_CONTEXT.md` for architecture and rules
2. Read `PROJECT_ROADMAP.md` for current phase and scope
3. Read `SYSTEM_LEDGER.md` for known issues and file history
4. Present a plan with: what files to change, what the changes are, why they're needed
5. Wait for user to say "proceed" or "approved"

### What Requires a Plan:
- Creating new files
- Modifying existing files
- Running shell commands that change the system
- Installing new dependencies
- Changing configuration files

### What Does NOT Require a Plan:
- Reading files for exploration
- Running read-only commands (git status, git log, ls)
- Searching for patterns (grep, glob)

---

## 3. Session Management

### Boot Sequence (Session Start):
```
1. Read AI_CONTEXT.md — understand project identity, tech stack, rules
2. Read PROJECT_ROADMAP.md — understand current phase, blockers, scope
3. Read SYSTEM_LEDGER.md — understand file state, known issues, next actions
4. Confirm understanding before beginning work
```

### Quick Boot (Context Refresh):
```
1. Read AI_CONTEXT.md and SYSTEM_LEDGER.md
2. Resume work from where we left off
```

### Close-Out (Session End):
```
1. Update PROJECT_ROADMAP.md — mark completed tasks, update phase status
2. Update SYSTEM_LEDGER.md — add new files to ledger, update known issues, add next actions
3. Confirm all changes are committed and pushed
```

---

## 4. Scope Control

### Work Strictly Within Active Phase:
- Read `PROJECT_ROADMAP.md` to find the 🔴 ACTIVE phase
- Only work on tasks within that phase
- If user requests out-of-scope work, flag it and ask to update the roadmap first

### Current Phase:
- **Phase 3: Vercel Deployment** — Fix build, env vars, Google OAuth

### Out of Scope (Do NOT Work On):
- Backend Railway deployment (Phase 5)
- CI/CD setup (Phase 6)
- Performance optimization (Phase 6)
- Adding new features (not in any phase)

---

## 5. Code Standards

### Frontend:
- Use `"use client"` directive at top of files with React hooks
- Use `cn()` from `@/lib/utils` for conditional classes
- Use `fetchAPI()` from `@/lib/api/client.ts` for API calls
- Use `useSession()` from `@/hooks/useSession` for session data
- Use Radix UI primitives for accessible components
- Follow existing component patterns (check neighboring files first)

### Backend:
- Follow module pattern: `modules/[domain]/routes/` + `modules/[domain]/services/`
- Validate all inputs with Zod schemas
- Use `authenticate` middleware for protected routes
- Use `rateLimiter` for public endpoints
- Log with Winston (`logger.info()`, `logger.error()`)

### General:
- Never use `any` type in new code
- Never commit secrets or env files
- Always handle errors in fetch/API calls
- Check existing dependencies before adding new ones

---

## 6. Git Workflow

- Never commit unless user explicitly asks
- Stage only intended files (never secrets, node_modules, .next)
- Write concise commit messages matching the project style: `type(scope): description`
- Commit types: `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `test`
- Always run build verification before committing

---

## 7. Communication

- Be concise — output will be displayed on a CLI
- Explain what you're doing and why before doing it
- If something is ambiguous, ask for clarification
- When reporting errors, include the exact error message and file path
- Reference specific file paths with line numbers when discussing code
