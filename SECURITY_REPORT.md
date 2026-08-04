# CleanFlow Security Review

Scope: full-stack audit of the CleanFlow monorepo (Next.js 15 App Router, Prisma + SQLite, Base UI primitives, wagmi wallet). Reviewed every API route, auth/session flow, server page gate, and client auth helper. Findings are static-analysis verified against the actual source; exploit paths marked **[verified]** were traced end-to-end through the code.

Severity key: CRITICAL (must fix before demo/prod) · HIGH · MEDIUM · LOW · INFO.

---

## 1. CRITICAL — Email login requires NO password/verification: full account takeover by design

**File:** `app/api/auth/session/route.ts:31-34`, `lib/client-auth.ts:11-20`

`POST /api/auth/session` logs a user in with **only** an email address:

```ts
if (email) {
  const found = await db.user.findFirst({ where: { email } });
  if (!found) throw new ApiError("INVALID_CREDENTIALS", 401, ...);
  user = toSessionUser(found);
}
```

There is **no password, no OTP, no token, nothing** — an attacker only needs to know (or guess) a registered email. The seeded demo accounts are:

```
merchant@cleanflow.dev   → MERCHANT
business@cleanflow.dev   → BUSINESS
compliance@cleanflow.dev → COMPLIANCE
admin@cleanflow.dev      → ADMIN
```

These emails are displayed verbatim as one-click buttons on the public login page (`components/auth/login-form.tsx:75-99`). Any visitor can click **Admin** and become a platform ADMIN with full visibility, or type `admin@cleanflow.dev` into the email field and press Continue. For a product positioned as a compliance/trust platform (AMLA), this is the single most damaging finding a judge will hit.

**[verified]** Reproduction: open login → click "Admin" demo chip → server issues a signed `cf_session` cookie for the admin user → land on `/dashboard`.

**Remediation:**
- Never allow ADMIN/COMPLIANCE elevation via plain email. Add proof of possession at minimum (OTP email, signed message). For a real product, require a wallet-signature challenge verified server-side.
- Do not seed platform-admin accounts, or gate them behind `SESSION_SECRET`-protected env bootstrap only.
- Treat the one-click demo boxes as "demo" only when the whole app runs in an explicitly-labeled demo mode.

---

## 2. CRITICAL — Wallet login auto-registers ANY address with no ownership proof (impersonation)

**File:** `app/api/auth/session/route.ts:35-54`, `lib/client-auth.ts:22-31`, `components/auth/login-form.tsx:54-70`

The client calls `signMessageAsync(...)` then `loginWithWallet(walletAddress, true)`, but **the signature is never sent to the server**. The server only checks the address *format* (`/^0x[0-9a-f]{40}$/`) and, with `autoRegister=true`, creates a session for any address:

```ts
let found = await db.user.findUnique({ where: { walletAddress } });
if (!found && autoRegister) {
  found = await db.user.create({ data: { walletAddress, name: name ?? null, role: "MERCHANT" } });
}
```

Consequences:
- Anyone who knows a registered user's wallet address can **impersonate that user** by POSTing `{ walletAddress, autoRegister: true }` — no signature check defeats the entire purpose of wallet auth.
- Anyone can mass-create arbitrary MERCHANT accounts (sybil) since no proof-of-ownership exists.

**Remediation:** Generate a server-side nonce per session, have the client sign it, verify `recoverPublicKey`/`verifyMessage` server-side before creating a session. Tie `autoRegister` to a verified signature.

---

## 3. CRITICAL — Forgeable session tokens when `SESSION_SECRET` is unset (default key)

**File:** `lib/auth/session.ts:10-12`

```ts
return process.env.SESSION_SECRET ?? "cleanflow-dev-secret-change-me";
```

Sessions are HMAC-SHA256 cookies. If `SESSION_SECRET` is not exported in the deploy environment, the fallback secret is committed in source. Anyone who knows the source can forge a valid `cf_session` cookie for **any `uid`**, becoming any user including ADMIN. Combined with finding #1, this is an open door in any non-dev deployment.

**Remediation:** In production, `process.exit(1)` (fail closed) if `SESSION_SECRET` is unset — never fall back to a public default. Optionally use `__Host-` cookie prefix.

---

## 4. HIGH — No global middleware: no auth gate, no security headers, no rate limiting

**File:** `middleware.ts` **does not exist**; `next.config.ts:3-13` sets **only** `images.remotePatterns` — zero `headers()`.

- No `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy`, HSTS.
- No global auth redirect (each page does its own `getSessionUser`).
- **No rate limiting or brute-force protection anywhere** — especially on `/api/auth/session`, `/api/user/create`, `/api/verify`.

**Remediation:** Add a `middleware.ts` that enforces security headers and rate-limits sensitive routes (in-memory/DB/RateID-based keyed by IP + route).

---

## 5. HIGH — Server page routes do not verify role vs. path (broken access control on UI tier)

**Files:** `app/merchant/page.tsx`, `app/business/page.tsx`, `app/compliance/page.tsx`, `app/agent/page.tsx`, `app/dashboard/page.tsx`

All five pages do:

```ts
const user = await getSessionUser();
if (!user) redirect("/login");   // only checks "logged in"
```

None compare `user.role` to the path. A MERCHANT (or anyone, including a freshly auto-registered wallet) can visit `/business`, `/compliance`, `/agent`, or `/dashboard` and get that role's UI. `RoleHome`/`Overview` render role-specific content and quick actions regardless.

The actual **data** is still scoped server-side at the API layer (`/api/audit` requires COMPLIANCE/ADMIN; `getScopedTransactionWhere` narrows tx scope; `buildDashboardSummary` gates agent counts; `/api/agent` requires `ownerId`), so this is a UI/UX-tier access-control gap rather than a data exfiltration hole — but it is confusing and sloppy for a compliance demo, and any future API that forgets to scope becomes exploitable through these open pages.

**Remediation:** Add a role gate helper (`requireRole(pathRole)`) and reject/redirect when `user.role` doesn't match the route role.

---

## 6. HIGH — `GET /api/report` has write side-effects (non-idempotent GET, DB bloat)

**File:** `app/api/report/route.ts:71-82`

`GET /api/report` *generates and persists* a new report row on **every** call (it shares the same `generateReport()` as POST). The reports view (`useReports` in `hooks/use-api.ts:85-91`) calls this on mount, so **every page visit to Reports writes a new report row**, and `listHistory` returns `take: 20` of ever-growing data. GET must be idempotent/read-only.

**Remediation:** Split into `GET` (read latest + history) and `POST` (generate). Add `POST /api/report/generate` or generate on-demand via a button only.

---

## 7. HIGH — Unauthenticated write endpoint: `POST /api/demo` mutates the DB

**File:** `app/api/demo/route.ts:240-251`

The demo endpoint requires no session and its `audit` step **creates a COMPLIANCE user** (`demo-compliance@cleanflow.dev`) and **persists a report** if they don't exist:

```ts
app/api/demo/route.ts:170-217
```

Once that user exists, the attacker can log in as them via the email-only login (finding #1) to become a COMPLIANCE officer — a two-step privilege-creation chain. It also lets unauthenticated callers write unlimited reports, poisoning the audit trail a compliance product is supposed to protect.

**Remediation:** Require an authenticated user for the demo route (or gate it behind a `DEMO_MODE` flag + known demo identity), and/or don't persist demo artifacts to shared tables.

---

## 8. MEDIUM — `readJson` silently swallows malformed JSON (robustness + ambiguity)

**File:** `lib/api.ts:42-47`

```ts
try { return await request.json(); } catch { return {}; }
```

A malformed body becomes `{}`, and endpoints that read with `typeof body.x === "number" ? body.x : ...` fall back to defaults silently (e.g. `ipAddress = "local"`, `amount` becomes `Number(undefined) = NaN` → validated). Most routes still validate and fail correctly, so impact is limited — but it hides client/proxy faults behind server defaults instead of a clean 400. Prefer a 400 `INVALID_JSON`.

---

## 9. MEDIUM — Email enumeration on login

**File:** `app/api/auth/session/route.ts:33`

```ts
if (!found) throw new ApiError("INVALID_CREDENTIALS", 401, "No account found for this email.");
```

A distinct, descriptive message ("No account found for this email") confirms whether an email is registered. With no rate limiting (finding #4) this enables account enumeration at scale.

**Remediation:** Return the same generic error regardless of existence, and add rate limiting.

---

## 10. MEDIUM — Client-supplied `x-forwarded-for` is trusted for the audit trail (IP spoofing)

**Files:** `app/api/auth/session/route.ts:27`, `app/api/verify/route.ts:61`, `app/api/transaction/create/route.ts:15`, `app/api/rules/create/route.ts:48`

IP is taken straight from the request header with no validation, and stored in `auditLog.ipAddress`. On an app where the IP is part of an immutable audit trail, an attacker can spoof any origin. Trust the header only behind a trusted proxy (Vercel sets it reliably, but validate format + fall back to `request.headers` only from `x-forwarded-for` when presented by the platform).

---

## 11. MEDIUM — Login/register inputs have no length or payload limits

**Files:** `app/api/user/create/route.ts`, `app/api/rules/create/route.ts:9-15`, `app/api/business/*`

`name`, `description`, rule `conditions` (raw JSON), business `description` are stored with no max length. Unbounded JSON `conditions` and long strings can bloat the SQLite DB and drive request-size DoS via a low-cost endpoint (`/api/user/create`, `/api/rule/create` are cheap, open writes).

**Remediation:** Clamp string lengths; validate `conditions` is a bounded object (e.g. max 20 keys, string values ≤ 1 KB).

---

## 12. LOW — `handleApiError` leaks `error.message` to the client; currently dead code

**File:** `lib/api.ts:33-40`

```ts
export function handleApiError(error: unknown) {
  ...
  const message = error instanceof Error ? error.message : "Internal server error";
  return fail(message, 500, "INTERNAL");   // leaks raw message on 500
}
```

Grep shows it is **not imported anywhere** (routes use `console.error` + generic `fail`), so it is not exploitable today. Remove it or neutralize the message passthrough so future misuse can't leak stack/DB details.

---

## 13. LOW — Session cookie: no `__Host-` prefix, no revocation, fixed 7-day TTL

**File:** `lib/auth/session.ts:46-52`

Cookie is `httpOnly`, `sameSite: "lax"`, `secure: NODE_ENV==="production"`, 7-day `maxAge`. That's a reasonable baseline. Improvements for a compliance product:

- Use `__Host-` prefix (requires `secure` + `Path=/` + no `Domain` → matches current settings).
- Add brute-force/rotation and per-user session revocation (currently `destroySession` only clears the cookie; server never invalidates tokens server-side).
- Consider flagging a `SESSION_TTL` shorter than 7 days for elevated roles.

---

## 14. INFO — No CSRF token

State-changing requests rely solely on `sameSite: "lax"`. Lax blocks cross-site POST cookies and most cross-site GETs except top-level navigations, so risk is moderate — but a defense-in-depth `csrf` token (or verifying a custom header) on all mutations is recommended for a financial product.

---

## Things verified as CORRECT (no action needed)

- **IDOR on agents:** `app/api/agent/[id]/route.ts` PATCH checks `agent.ownerId !== user.id`.
- **IDOR on transactions:** `app/api/transaction/[id]/route.ts` PATCH enforces an action allowlist and owner/overseer gate.
- **Transaction creation:** validates receiver `0x[40 hex]`, positive amount, known type; enforces agent daily/monthly spend limits with DB aggregates (`app/api/transaction/create/route.ts:24-73`).
- **Data scoping:** transactions (`/api/transaction`), dashboard summaries (`getScopedTransactionWhere`), agents (`ownerId`), and audit logs (COMPLIANCE/ADMIN only) are all scoped at the API layer.
- **No XSS sink:** zero `dangerouslySetInnerHTML` usages across the repo.
- **Session cookie basics:** `httpOnly`, `sameSite: lax`, HMAC-signed, exp check via `timingSafeEqual`.
- **Audit logging:** write-scoped audit entries on login, user create, rule create, verify, tx create/action.

---

## Prioritized fix order (max risk-per-effort for a hackathon demo)

1. Kill the email-only login path for ADMIN/COMPLIANCE (finding #1) — gate demo elevation behind a real check.
2. Verify wallet signatures server-side / prevent arbitrary-address impersonation and auto-register (#2).
3. Fail closed when `SESSION_SECRET` is unset (#3) and set it in `.env`/platform.
4. Make `GET /api/report` read-only (#6) and require auth on `/api/demo` (#7).
5. Add `middleware.ts` with security headers + basic rate limiting (#4), role-vs-path gates (#5).