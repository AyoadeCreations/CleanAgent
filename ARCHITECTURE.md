# CleanFlow Architecture

## Overview

CleanFlow is a Next.js 16 App Router monolith. Server Components render pages; API route
handlers perform auth, Cleanverse checks, and database writes; interactive components fetch
data through TanStack Query.

```
Browser
  │  (server-rendered pages + client components)
  ▼
Next.js app/  ──────  app/api/*  (route handlers)
                     ├── auth/session, auth/me       session login/logout
                     ├── user/create                 wallet registration
                     ├── verify, verify/asset        CVI / CVA
                     ├── agent, agent/[id]           agent CRUD + limits
                     ├── rule                        tenant policy rules
                     ├── transaction, transaction/[id], transaction/create
                     ├── dashboard                   KPIs + volume charts
                     ├── report, audit, asset, business
                     └── (all require session cookie)
                          │
                          ▼
                     lib/cleanverse/  (mock-first CVI, CVA, CCP)
                          │
                          ▼
                     Prisma 7 + SQLite (lib/database/)
```

## Modules

| Path | Responsibility |
| ---- | -------------- |
| `app/` | Pages (landing, auth, onboarding, role homes, dashboard) |
| `app/api/` | REST endpoints; every handler requires a session user |
| `lib/auth/session.ts` | HMAC-signed `cf_session` cookie helpers |
| `lib/cleanverse/` | `cvi.ts` (identity), `cva.ts` (assets), `ccp.ts` (policy engine), `client.ts` (mock flag + fallback) |
| `lib/database/` | Prisma client, scoped query helpers, mappers, audit writer |
| `lib/blockchain/` | `monad.ts` (chain config), `wallet.ts` (wagmi config) |
| `components/` | UI kit (`ui/`), landing, auth, onboarding, dashboard |
| `hooks/` | `use-wallet.ts`, `use-api.ts` (typed React Query hooks) |
| `contracts/` | Reference Solidity: `IdentityRegistry`, `AgentRegistry`, `Escrow` |

## Data model (`prisma/schema.prisma`)

- `User` — role (`MERCHANT | BUSINESS | COMPLIANCE | ADMIN`), wallet, KYC status.
- `Business` — company profile owned by a user; groups `Agent`s and `Rule`s.
- `Agent` — autonomous actor with `dailyLimit`, `monthlyLimit`, `permissions`, status.
- `Transaction` — every payment with `riskScore`, `riskLevel`, `status`, `type`, `reference`,
  and metadata (`decisions`, `auditHash`).
- `Rule` — tenant CCP rule: `type`, `conditions`, `action`, `priority`, `enabled`.
- `Report` — signed compliance report with `reportHash`.
- `Verification` — CVI/CVA check outcomes.
- `Asset` — verified token/NFT/receivable/point.
- `AuditLog` — append-only trail of sensitive actions.

## Key flows

### Transaction lifecycle

```
POST /api/transaction/create
  1. validate receiver/amount/type
  2. resolve agent (if any) + enforce daily/monthly limits (projected)
  3. load tenant rules → validateTransaction() (CCP)
     - blocklist / allowlist / max-amount / risk-threshold evaluations
     - riskScore + auditHash computed
  4. status = BLOCKED if rejected, APPROVED if riskScore >= 60, else EXECUTED
  5. persist Transaction + AuditLog
```

### CCP rule engine (`lib/cleanverse/ccp.ts`)

Each rule has `type` (`ALLOWLIST`, `BLOCKLIST`, `MAX_AMOUNT`, `RISK_THRESHOLD`) and
`conditions`. `validateTransaction` returns `approved`, `riskScore`, `flags`, `decisions`,
and an `auditHash`. Deny-by-default: unknown receivers fail the allowlist.

### Identity verification

`POST /api/verify` → `verifyIdentity()` (mock CVI) → writes/updates a `Verification` row and
sets `user.verified` + `user.kycLevel` → `AuditLog` entry.

## Auth

- Email login: looks up the seeded/existing user by email.
- Wallet login: accepts a valid `0x` address; auto-registers a `MERCHANT` user when
  `autoRegister` is set.
- Session cookie `cf_session` is signed with an HMAC secret (`SESSION_SECRET` env).
- Route handlers use `requireApiUser()`; page layouts use `getSessionUser()` and redirect.

## Cleanverse integration

Mock-first: `CLEANVERSE_MOCK_ENABLED` (default true) short-circuits SDK calls with plausible
results. `withFallback` ensures failures degrade gracefully. Swap each `lib/cleanverse/*`
module for live SDK calls without touching route handlers.

## Smart contracts (`contracts/`)

Reference implementations that mirror web-side logic:

- `IdentityRegistry.sol` — maps wallets to verified identities + KYC level.
- `AgentRegistry.sol` — agent registry with enforced daily/monthly spend limits.
- `Escrow.sol` — payer/resolver escrow with release and refund.

## Known MVP gaps

- Wallet signatures are not verified server-side.
- Cleanverse SDK calls are mocked.
- Contracts are not deployed or wired to the UI.
- `BUSINESS`-scoped `COMPLIANCE` role dashboards are not fully role-permissioned on every page.
