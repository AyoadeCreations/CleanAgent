# CleanFlow — Known Issues & Judge-Break Checklist

Purpose: everything a hackathon judge could plausibly poke at, trip over, or use to "break" the app — ranked by how damaging it is. Each entry has **Steps to reproduce**, **Why it matters**, and **What we'd change**. Everything here is verified against the current source (`HEAD 5bfd58b`).

Severity: 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low.

---

## 🔴 1. Log in as Admin with zero credentials (one click)

- **Where:** `app/api/auth/session/route.ts:31-34` · `components/auth/login-form.tsx:75-99`
- **Steps:** Open `/login`. Click the **"Admin"** demo card (email `admin@cleanflow.dev`). You are now signed in as a platform ADMIN and land on `/dashboard` with the admin RoleHome. Same trick works for `compliance@cleanflow.dev` (COMPLIANCE).
- **Why it matters:** The product pitch is a compliance/AMLA platform; a judge can become the compliance officer or admin without any credential. The emails are printed on the login screen itself.
- **Fix:** Remove ADMIN/COMPLIANCE demo chips, or make them visibly "demo only" and require a real check (OTP/signature) before granting elevated roles. See SECURITY_REPORT #1.

---

## 🔴 2. Impersonate any wallet by typing its address

- **Where:** `app/api/auth/session/route.ts:35-54` · `lib/client-auth.ts:22-31`
- **Steps:** POST to `/api/auth/session` with `{ "walletAddress": "<any existing user's address>", "autoRegister": true }`. The server never verifies the signed message (the signature is discarded client-side) — it creates/finds the user and issues a session.
- **Why it matters:** Wallet auth is the demo's primary onboarding story; a judge can "connect" as someone else's wallet and take over that user's workspace view.
- **Fix:** Server-side nonce + `verifyMessage` before issuing the session; gate auto-register behind a verified signature.

---

## 🔴 3. Forge sessions if `SESSION_SECRET` is missing in prod

- **Where:** `lib/auth/session.ts:10-12`
- **Steps:** Deploy without setting `SESSION_SECRET` → HMAC key falls back to the committed string `cleanflow-dev-secret-change-me`. Anyone who knows the source can craft `cf_session` = base64url(`{"uid":"<any id>","exp":<future>}`) + valid HMAC.
- **Why it matters:** Total authentication bypass in any environment that forgets the env var. Also a judge might spot the hardcoded default while reading the repo.
- **Fix:** Throw/exit if `SESSION_SECRET` is unset in production.

---

## 🟠 4. Role-gated pages are not actually role-gated

- **Where:** `app/merchant/page.tsx`, `app/business/page.tsx`, `app/compliance/page.tsx`, `app/agent/page.tsx`, `app/dashboard/page.tsx` (all only `if (!user) redirect("/login")`)
- **Steps:** Sign in as any role (even a freshly auto-registered wallet), then navigate directly to `/compliance` or `/dashboard`. You get the compliance/admin UI shell. Quick actions and nav reflect the target role.
- **Why it matters:** Looks like broken access control. Actual *data* is still scoped at the API layer, so this is cosmetic today — but it reads badly and is one forgotten scope-check away from a real leak.
- **Fix:** Server-side `requireRole(pathRole)` on each route group.

---

## 🟠 5. Loading the Reports page writes a new report to the DB every time

- **Where:** `app/api/report/route.ts:71-82` (GET shares `generateReport()`), consumed by `hooks/use-api.ts:85-91` `useReports()`
- **Steps:** Open `/dashboard/reports` (or `/reports`) → GET fires → a new `Report` row is created → history grows on every visit. Refresh repeatedly and watch the DB bloat; the report timestamp changes on each load.
- **Why it matters:** GET with write side-effects is a textbook API bug; judges will notice "the report changes every refresh." Also unbounded row growth.
- **Fix:** Make GET read-only; generate only via POST / a button.

---

## 🟠 6. Unauthenticated `/api/demo` mutates the database

- **Where:** `app/api/demo/route.ts:170-217` (`audit` step)
- **Steps:** Without logging in, POST `/api/demo` `{ "step": "audit" }`. The server creates a `demo-compliance@cleanflow.dev` COMPLIANCE user and a persisted report. Now log in with that email (no password) → you're a compliance officer. Repeat to create unlimited reports.
- **Why it matters:** A public write endpoint that self-provisions an elevated account + pollutes the audit trail. Directly enables finding #1 for the compliance role.
- **Fix:** Require an authenticated session (and gate demo writes to a demo tenant).

---

## 🟠 7. Dashboard hero is hardcoded "Helios"

- **Where:** `app/dashboard/page.tsx:16-23`
- **Steps:** Sign in as any user (business, compliance, or a brand-new wallet) and open `/dashboard`. The hero says **"Merchant workspace"** and **"Good to see you, Helios"** for everyone.
- **Why it matters:** Instantly proves the dashboard isn't personalized; a judge on a fresh account sees someone else's name. Common "this is fake/demo-only" signal.
- **Fix:** Render the real `user.name` and role-derived workspace label server-side.

---

## 🟠 8. Activity feed is static/hardcoded, yet labeled "Live"

- **Where:** `components/dashboard/activity-feed.tsx:13-20` (a const array), badge at line 30-33 says "Live".
- **Steps:** Create transactions/agents, then open Overview — the feed never changes and shows events for "Helios Logistics" even for unrelated users.
- **Why it matters:** Labeling static data as "Live" is the kind of polish lie judges check for. Either wire it to `/api/audit` or rename the badge.
- **Fix:** Drive the feed from `useAuditLogs()` (scoped per role) or relabel.

---

## 🟡 9. Stats "verified users" is platform-wide for every role

- **Where:** `lib/database/summary.ts:27` (`verifiedUsers = db.user.count({ where: { verified: true } })`)
- **Steps:** Sign in as a MERCHANT and read the Overview stat cards — "Verified users" is the *global* count across all accounts, not scoped to the tenant.
- **Why it matters:** Minor data-accuracy nit; merchants see platform numbers presented as their own. Low-key but judge-visible.
- **Fix:** Scope the count (or relabel as platform metric only for ADMIN/COMPLIANCE).

---

## 🟡 10. Wallet connect is awkward when no injected wallet / WalletConnect key missing

- **Where:** `lib/blockchain/wallet.ts` — WalletConnect only registers if `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set; `components/auth/login-form.tsx:57` uses `connectors[0]`.
- **Steps:** On a machine without an injected wallet (and no project ID configured), the "Connect wallet" button either does nothing or errors. The reliable path is email/demo chips.
- **Why it matters:** The wallet sign-in flow is the marquee demo path and can silently fail in a judge's environment.
- **Fix:** Show explicit "install a wallet" empty state, or fall back to email OTP demo flow with a clear error.

---

## 🟡 11. Onboarding can skip identity verification entirely

- **Where:** `components/onboarding/onboarding-flow.tsx:213-229` — Done step lets you "Go to dashboard" even when `verified === false`.
- **Steps:** Register with a fresh wallet, in onboarding hit "Run identity check", then click through without verifying (or verify is already true from a prior run). The Done screen explicitly says you can continue unverified.
- **Why it matters:** For an identity/compliance product, an unverified user reaching the dashboard undercuts the core story — a judge may note the loophole.
- **Fix:** Block the final Continue when unverified (show a "verify to proceed" gate).

---

## 🟡 12. Rule types don't have to match their conditions (validation is shallow)

- **Where:** `app/api/rule/create/route.ts` stores `conditions` as raw JSON with no schema validation per `type`.
- **Steps:** Create a rule of `type: "MAX_AMOUNT"` with arbitrary/malformed conditions. It's stored and applied verbatim by the CCP (`app/api/transaction/create/route.ts:76-88`).
- **Why it matters:** A judge can craft nonsense rules that may break evaluation (e.g. missing `operator`/`value`). Also a correctness risk for the risk engine.
- **Fix:** Validate conditions shape per rule type server-side; coerce/fail with a clear message.

---

## 🟡 13. Several API routes have no rate limiting or length caps

- **Where:** login, register (`/api/user/create`), verify, demo, rule/create — all unlimited.
- **Steps:** Script any of them; no throttling, no backoff, no account-lockout on repeated failed logins.
- **Why it matters:** Spam/brute-force surface; pairs with email enumeration (login returns distinct "No account found for this email.").
- **Fix:** Rate-limit auth endpoints (in-memory per IP is fine for a demo) + generic login error messages.

---

## 🔵 14. Hardcoded `x-forwarded-for` trust for audit IP

- **Where:** `app/api/auth/session/route.ts:27`, `app/api/verify/route.ts:61`, `app/api/transaction/create/route.ts:15`, `app/api/rule/create/route.ts:48`
- **Steps:** Send `x-forwarded-for: 203.0.113.99` on any audited action → that IP is recorded verbatim in `auditLog`.
- **Why it matters:** Audit-trail integrity nit; IPs are spoofable behind the header.
- **Fix:** Validate/normalize the header (accept only from trusted proxy) before persisting.

---

## 🔵 15. Hardcoded demo copy scattered in role home & nav

- **Where:** `components/dashboard/role-home.tsx`, sidebar/topbar labels, `activity-feed.tsx`, `app/dashboard/page.tsx`.
- **Steps:** Browse as a fresh account; several panels reference "Helios Logistics" / demo transactions that don't exist for that user.
- **Why it matters:** Empty-state stories are inconsistent with real data; a judge with a clean DB sees placeholder-heavy pages.
- **Fix:** Add real empty states per view (transactions/agents/rules/reports) and drop hardcoded demo names when the tenant has no data.

---

## 🔵 16. `GET /api/auth/me` returns `200 { user: null }` instead of 401

- **Where:** `app/api/auth/me/route.ts:6-13`
- **Steps:** Call `/api/auth/me` logged out → 200 with `{user:null}`. Callers using `res.ok` would treat it as success.
- **Why it matters:** Minor API hygiene; inconsistent with other protected routes that return 401.
- **Fix:** Return 401 (or keep 200 but document it) consistently.

---

## 🔵 17. Empty dashboard risk/volume charts for clean tenants

- **Where:** `components/dashboard/overview.tsx` + `lib/database/summary.ts` — all zeros for a fresh user.
- **Steps:** New account → Overview shows zero-volume bars, empty risk distribution, 0% trends with no explanatory empty state.
- **Why it matters:** Looks broken rather than "no data yet."
- **Fix:** Render a friendly empty state ("No activity yet — create your first transaction").

---

## 🔵 18. Form inputs have no maxLength / limits (e.g., business description, rule name)

- **Where:** `components/onboarding/onboarding-flow.tsx` (Textarea), rule create dialog, business create.
- **Steps:** Paste a huge string → stored as-is (server has no cap either, see SECURITY #11).
- **Why it matters:** UI polish + small DB-bloat vector.
- **Fix:** `maxLength` on client + validation on server.

---

## Not broken (checked) — don't chase these

- Transaction create: receiver regex, positive amount, type allowlist, agent daily/monthly limit enforcement — correct.
- Agent PATCH (agent/[id]) and transaction action PATCH: owner/overseer checks present.
- No `dangerouslySetInnerHTML` anywhere — no obvious stored/reflected XSS sink.
- Audit logging exists on auth, user create, rule create, verify, tx create/action.
- Auth-scoped tx lists (`getScopedTransactionWhere`) and agent lists (`ownerId`) are properly scoped.

---

## Quick judge-demo safety checklist (lowest-risk setup for judging)

1. Set `SESSION_SECRET` and `CLEANVERSE_MOCK=true` in `.env`.
2. Seed demo accounts but **remove the ADMIN/COMPLIANCE one-click login chips** (or visibly gate them).
3. Pre-create some transactions/agents for the merchant/business demo accounts so the dashboards aren't empty.
4. Use the `/demo` page for the walkthrough (public, no auth needed) and sign judges into the merchant account for the app tour.
