# Production Readiness Plan & Tracker

**Audit date:** 2026-09-24
**Scope:** Next.js 16 app in `ppt-ai/` (frontend, API routes, server actions), Prisma/PostgreSQL, NextAuth v5, PayPal billing, AI generation (OpenAI via AI SDK), UploadThing, Upstash rate limiting, Sentry, PostHog, Langfuse.

Each work item ships as its **own pull request** against `master`. The tracker at the bottom is the source of truth for status.

---

## 1. Current status (audit findings)

### Health checks run

| Check | Command | Result |
|---|---|---|
| Install | `pnpm install --frozen-lockfile` | ✅ passes |
| Typecheck | `pnpm type` | ✅ passes (0 errors) |
| Lint | `pnpm lint` (Biome) | ❌ 9 errors, 74 warnings |
| Unit tests | `npx vitest run` | ❌ 1 of 2 files fails — env validation runs on import, no test env |
| Build | `SKIP_ENV_VALIDATION=1 pnpm build` | ❌ fails collecting page data: Tavily client needs `TAVILY_API_KEY` at import time; `metadataBase` needs a valid `NEXTAUTH_URL` (fixed in P1-7) |
| CI | `.github/workflows` | ❌ none — nothing gates merges |

### Backend / API

| Severity | Area | Finding |
|---|---|---|
| 🔴 Critical | Auth | Admin credentials provider falls back to password **`admin123`** when `ADMIN_PASSWORD` is unset, and plain `===` comparison. If the email isn't in the DB it signs in a fake user `admin-temp-id`. |
| 🔴 Critical | Billing | PayPal webhook `verifyWebhook()` is stubbed to `return true` — anyone can POST fake `PAYMENT.*` / `BILLING.*` events. |
| 🔴 Critical | Billing | Webhook reads `event.eventType`, but PayPal sends `event_type` (snake_case). **No event is ever handled** — cancellations, renewals and failed payments are silently dropped. |
| 🔴 Critical | Billing | `POST /api/paypal/subscription/activate` syncs *any* PayPal subscription ID to the caller's account — a user can claim someone else's paid subscription. |
| 🟠 High | Billing | Payment rows are created without idempotency; PayPal retries webhooks → duplicate payments / unique-constraint 500s. |
| 🟠 High | API | `POST /api/paypal/checkout` returns `error.stack` to the client. |
| 🟠 High | API | `outline-with-search` has no rate limiting and no usage tracking (the most expensive route: up to 5 Tavily calls + LLM). |
| 🟠 High | API | No input validation on AI routes: `numberOfCards`, `outline`, `prompt` are unbounded → cost abuse / prompt stuffing. |
| 🟠 High | API | `modelPicker` lets any client choose `ollama` / `lmstudio`, making the server call `localhost` in production. |
| 🟠 High | Billing | Plan limits (`PLAN_LIMITS`) are defined but never enforced on generation routes. |
| 🟡 Medium | Server actions | `getCustomThemeById` returns private themes to anyone who knows the ID. |
| 🟡 Medium | Middleware | Logs every request plus the full `ADMIN_EMAILS` list and user emails (PII in logs). |
| 🟡 Medium | API | `POST /api/contact/sales` has no rate limit, no length validation, and never notifies anyone (TODO). |
| 🟡 Medium | Ops | No health-check endpoint for uptime monitors / load balancers. |
| 🟡 Medium | Ops | No security headers (HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, nosniff). |

### Database

| Severity | Finding |
|---|---|
| 🟠 High | No `prisma/migrations` — schema is applied with `prisma db push`. No reviewable, repeatable migration history for production. |
| 🟡 Medium | Missing indexes on hot foreign keys: `BaseDocument.userId`, `FavoriteDocument.userId/documentId`, `GeneratedImage.userId`, `Account.userId`, `Presentation.customThemeId`. |
| 🟡 Medium | `FavoriteDocument` has no unique `(userId, documentId)` — duplicates possible. |

### Frontend

| Severity | Finding |
|---|---|
| 🟠 High | `ThinkingDisplay` calls `useState` after an early `return` → React "rendered more hooks" crash when thinking text arrives. |
| 🟡 Medium | `dangerouslySetInnerHTML` lint errors (JSON-LD blocks) — need an explicit, reviewed suppression or safe serialization that escapes `</script>`. |

### Config / DX

| Severity | Finding |
|---|---|
| 🟡 Medium | `.env.example` is missing PayPal, admin, Upstash, Resend, Sentry, Langfuse variables; `env.js` doesn't declare `ADMIN_PASSWORD`, `UPSTASH_*`. |
| 🟡 Medium | Vitest cannot run without a real `.env` (env validation on import). |

---

## 2. Plan

Work is ordered by risk: security and money first, then correctness, then operability.

### Phase 1 — Stop the bleeding (security & billing)
1. **P1-1 Harden admin login** — require `ADMIN_PASSWORD` (no default), timing-safe compare, no fake user, only sign in an existing DB user.
2. **P1-2 PayPal webhook** — real signature verification via PayPal `verify-webhook-signature` API, parse `event_type`, idempotent payment writes, correct plan name in email.
3. **P1-3 Subscription ownership** — activation only for subscription IDs that were created for the caller at checkout; stop leaking stack traces from checkout.
4. **P1-4 AI route hardening** — zod validation with bounds, rate limit on `outline-with-search`, disable local model providers in production, enforce plan quota.

### Phase 2 — Correctness & quality gates
5. **P1-5 Fix frontend hook bug + lint errors** so `pnpm lint` passes.
6. **P1-6 Test harness** — vitest runs without secrets; add unit tests for new security logic.
7. **P1-7 CI** — GitHub Actions: install → lint → typecheck → test → build on every PR.

### Phase 3 — Database
8. **P2-1 Baseline Prisma migrations** + indexes/unique constraints, `db:migrate` scripts, documented deploy step.

### Phase 4 — Operability
9. **P2-2 Health endpoint** `/api/health` (DB ping).
10. **P2-3 Security headers** in `next.config.js`.
11. **P2-4 Quiet middleware** — remove PII / per-request logging.
12. **P2-5 Private theme leak** fix in `getCustomThemeById`.
13. **P2-6 Contact-sales endpoint** — validation, rate limit, email notification.
14. **P2-7 Env hygiene** — complete `.env.example` + `env.js` declarations.

### Out of scope for this pass (follow-ups)
- Migrating `middleware.ts` → `proxy.ts` (Next 16 deprecation) — needs runtime testing with NextAuth edge.
- Stripe support (schema columns exist, no code).
- E2E tests (Playwright) against a seeded database.
- Replacing `@paypal/checkout-server-sdk` (deprecated) entirely with REST calls.

---

## 3. Tracker

Legend: ⬜ todo · 🟨 in progress · ✅ PR opened · 🟩 merged

| ID | Item | Branch | PR | Status |
|---|---|---|---|---|
| P0 | Audit + this plan | `claude/project-production-readiness-q4pi9w` | — | 🟨 |
| P1-1 | Harden admin credentials login | `claude/prod-admin-auth` | [#2](https://github.com/procoder257/ppt-ai/pull/2) | ✅ |
| P1-2 | PayPal webhook verification + event parsing + idempotency | `claude/prod-paypal-webhook` | [#3](https://github.com/procoder257/ppt-ai/pull/3) | ✅ |
| P1-3 | Subscription activation ownership + no stack leak | `claude/prod-paypal-ownership` | [#4](https://github.com/procoder257/ppt-ai/pull/4) | ✅ |
| P1-4 | AI routes: validation, rate limit, provider lock, quota | `claude/prod-ai-route-hardening` | [#5](https://github.com/procoder257/ppt-ai/pull/5) | ✅ |
| P1-5 | Fix ThinkingDisplay hook bug + lint errors | `claude/prod-lint-fixes` | [#6](https://github.com/procoder257/ppt-ai/pull/6) | ✅ |
| P1-6 | Vitest runs without secrets | `claude/prod-test-harness` | [#7](https://github.com/procoder257/ppt-ai/pull/7) | ✅ |
| P1-7 | GitHub Actions CI | `claude/prod-ci` | [#8](https://github.com/procoder257/ppt-ai/pull/8) | ✅ |
| P2-1 | Prisma baseline migration + indexes | `claude/prod-db-migrations` | — | ⬜ |
| P2-2 | `/api/health` endpoint | `claude/prod-health-headers` | — | ⬜ |
| P2-3 | Security headers | `claude/prod-health-headers` | — | ⬜ |
| P2-4 | Remove PII/noisy middleware logs | `claude/prod-middleware-logs` | — | ⬜ |
| P2-5 | Private custom theme leak | `claude/prod-theme-access` | — | ⬜ |
| P2-6 | Contact-sales validation, rate limit, email | `claude/prod-contact-sales` | — | ⬜ |
| P2-7 | `.env.example` + `env.js` completeness | `claude/prod-env-hygiene` | — | ⬜ |

## 4. Deploy checklist (after PRs merge)

- [ ] Set `ADMIN_PASSWORD` (long, random) and `ADMIN_EMAILS` in the host.
- [ ] Set `PAYPAL_WEBHOOK_ID` from the PayPal dashboard (webhooks are rejected without it in production).
- [ ] Set `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (rate limiting is off without them).
- [ ] Existing database: run `pnpm prisma migrate resolve --applied 0_init` once, then `pnpm db:migrate:deploy` on each deploy.
- [ ] Point uptime monitoring at `/api/health`.
- [ ] Enable required status checks on `master` for the CI workflow.
