# CleanFlow — Hackathon Submission

> **Trust Every Transaction.** AI-powered trust, compliance, and payment orchestration built
> on Cleanverse (CVI / CVA / CCP) and Monad testnet.

## One-liner

CleanFlow gives merchants, businesses, and compliance officers a single workspace to verify
counterparties (identity + assets), police every payment against programmable policy, settle
with autonomous agents, and keep a signed, tamper-evident audit trail — with a guided, no-login
demo that walks the entire workflow.

## Problem

Payments between businesses fail trust silently: unverified counterparties, policy violations
discovered after funds move, and audit trails that can't be trusted. Existing tools split
identity, compliance, and execution across disconnected products, so teams patch together
spreadsheets and manual reviews.

## Solution

CleanFlow orchestrates the full payment lifecycle on Cleanverse primitives:

1. **Cleanverse Identity (CVI)** — verify the business and its wallet before it can act.
2. **Cleanverse Asset (CVA)** — verify the asset / treasury backing the payment.
3. **Cleanverse Compliance Policies (CCP)** — a programmable rule engine that scores and
   gates every transaction (allowlists, blocklists, caps, risk thresholds; deny-by-default).
4. **Autonomous agents** — spend-limited agents execute payroll, supplier, and treasury flows.
5. **Settlement + audit** — funds release, a signed report hash, and a public validation ledger.

## Key features (all live)

- **Guided demo** at `/demo` — 8 steps, no login: onboarding → CVI → CVA → agent → rules →
  transaction → settlement → audit. Ends with a signed report published to `/reports`.
- **Public audit viewer** at `/reports` — report identifier, per-transaction validation ledger
  (`PASS / FLAGGED / REJECTED / PENDING`), risk scores, previous signed reports.
- **Dashboard** — stat cards with 7-day trend indicators, volume/type/risk charts.
- **Transaction lifecycle timeline** — every transaction shows identity → asset → rules →
  approval → settlement → audit with policy decisions and audit hash.
- **Roles** — Merchant, Business, Compliance, Admin; role-scoped data and compliance controls
  (suspend / release / block).
- **Risk engine** (`lib/cleanverse/risk.ts`) — deterministic scoring feeding policy decisions
  and report generation.
- **Mobile-ready** — off-canvas navigation, horizontally scrollable tables, responsive grids.

## Demo accounts (passwordless)

| Role | Email |
| ---- | ----- |
| Merchant | `merchant@cleanflow.dev` |
| Business | `business@cleanflow.dev` |
| Compliance | `compliance@cleanflow.dev` |
| Admin | `admin@cleanflow.dev` |

## How to run

```bash
npm install
npx prisma db push
npx prisma db seed
npm run dev        # http://localhost:3100
```

See [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) for the exact demo flow and `README.md` for details.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn (base-ui) ·
Prisma 7 + SQLite · TanStack Query · wagmi/viem · Monad testnet · Framer Motion.

## Cleanverse integration

Mock-first (`CLEANVERSE_MOCK_ENABLED`, `withFallback`). Each `lib/cleanverse/*` module maps
1:1 to a Cleanverse capability (CVI, CVA, CCP) and can be swapped for live SDK calls without
touching route handlers or UI.

## What's next

- Verify wallet signatures server-side (currently client-collected).
- Deploy the reference contracts (`IdentityRegistry`, `AgentRegistry`, `Escrow`).
- Wire live Cleanverse SDK and multi-tenant onboarding.
