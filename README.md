# CleanFlow — Trust, Compliance & Payment Orchestration

**Trust Every Transaction.**

CleanFlow is an AI-powered trust, compliance, and payment orchestration MVP built on
**Cleanverse** infrastructure (verified identity **CVI**, verified assets **CVA**, rule-based
compliance **CCP**). It gives merchants, businesses, compliance officers, and autonomous
agents a single workspace to verify counterparties, police transactions against policy,
and keep an immutable audit trail.

## Stack

| Layer        | Tech |
| ------------ | ---- |
| Framework    | Next.js 16 (App Router) |
| UI           | React 19, TypeScript, Tailwind v4, shadcn (base-ui) |
| Data         | Prisma 7 + SQLite (dev), seeded demo data |
| State/data   | TanStack Query (React Query) |
| Web3         | wagmi / viem, Monad testnet |
| Auth         | HMAC-signed session cookie (email or wallet) |
| Cleanverse   | Mock-first integration in `lib/cleanverse/` |

## Quick start

```bash
npm install
npx prisma db push
npx prisma db seed      # demo users, business, agents, transactions, rules
npm run dev             # http://localhost:3100
```

Demo logins (passwordless, one-click on `/login`):

- Merchant: `merchant@cleanflow.dev`
- Business: `business@cleanflow.dev`
- Compliance: `compliance@cleanflow.dev`
- Admin: `admin@cleanflow.dev`

Wallet login is supported via `/api/auth/session` with an EVM address.

## What it does

- **Verified identities (CVI)** — run an identity check against a wallet; results stored as
  `Verification` records and reflected on the user (`verified`, `kycLevel`).
- **Verified assets (CVA)** — register and score a token/NFT/receivable as a verified asset.
- **Programmable compliance (CCP)** — transactions are scored against policy rules
  (blocklists, allowlists, max-amount, risk thresholds) and an audit hash is generated.
  Violations are auto-blocked; high-risk flows are auto-flagged.
- **Risk engine** — `lib/cleanverse/risk.ts` scores every transaction deterministically;
  `evaluateTransaction` combines the risk score with policy decisions and returns a signed result.
- **Autonomous agents** — agents with hard daily/monthly spending limits execute payments;
  the web app enforces limits server-side before creating the transaction.
- **Escrow-style flows** — `ESCROW` transaction type plus a reference Solidity escrow contract.
- **Audit trail** — every sensitive action is recorded in `AuditLog`; compliance officers get a
  full trail view and can suspend/release/block transactions.
- **Signed reports** — 30-day compliance reports carry a generated audit hash and are published
  to the public viewer at `/reports`.
- **Guided demo** — `/demo` walks a payment from identity verification through policy evaluation,
  settlement, and audit generation with a signed report — no account required.
- **Transaction timeline** — every transaction shows its full lifecycle
  (identity → asset → rules → approval → settlement → audit) with decision details.

## Architecture

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the module map, request flows, and the
reference smart contracts in [`contracts/`](./contracts/).

## Demo

- `/demo` — eight-step guided walkthrough ending in a signed compliance report.
- `/reports` — public audit report viewer with per-transaction validation ledger.
- `DEMO_SCRIPT.md` — the exact demo script used for the submission video/screenshots.

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm run lint         # ESLint
npm run db:seed      # reseed demo data
```

## Roadmap notes

- The Cleanverse integration is mock-first (`CLEANVERSE_MOCK_ENABLED`); swap `lib/cleanverse/*`
  for live SDK calls when keys are available.
- Smart contracts in `contracts/` are reference implementations, not yet deployed.
- Auth is session-cookie based; wallet signatures are collected client-side but not yet
  verified server-side (documented MVP gap).
