# CleanFlow — Demo Script

This is the exact demonstration flow used for the submission. It mirrors the guided
workflow at [`/demo`](http://localhost:3100/demo) and can also be replayed inside a
signed-in dashboard.

**Logins (passwordless on `/login`):**
- Business: `business@cleanflow.dev`
- Compliance: `compliance@cleanflow.dev`
- Admin: `admin@cleanflow.dev`

---

## Part A — Guided demo (`/demo`, no login required)

Open **`/demo`** and click **Start demonstration**. Follow the eight steps:

1. **Merchant onboarding** — business "Helios Logistics", industry "Freight & logistics".
   KYC level 2 documents are submitted. → `Run step`
2. **Identity verification (CVI)** — Cleanverse verifies incorporation, UEN, and beneficial
   ownership. Result: reference `cvi-helios-logis-XXXX`, identity score 96/100. → `Continue`
3. **Asset verification (CVA)** — the USDC treasury is verified as fiat-backed and audited.
   Asset score 92/100. → `Continue`
4. **Agent creation** — "Payables Agent" with a 10,000 daily / 220,000 monthly spend limit
   and scoped permissions. → `Continue`
5. **Rule creation (CCP)** — four policies compile into the tenant's compliance control plane:
   Supplier allowlist, Per-transaction cap (25,000), Sanctions blocklist, Risk threshold. → `Continue`
6. **Transaction execution** — amount **4,200 USDC**, receiver defaults to a verified supplier.
   Risk 22/100 (LOW). Decisions render as ✓/✗ per rule. → **Evaluate transaction** → `Settle funds`
7. **Settlement** — funds released, settlement ID and network fee recorded.
8. **Audit generation** — a signed report is generated and published to `/reports`.

Final confirmation screen shows exactly:

> Identity verified ✓ Asset verified ✓ Rules validated ✓ Settlement complete ✓ Audit report generated ✓

**Interactive twist (optional):** on step 6, set amount to **50,000** USDC → the per-transaction
cap blocks it ("Blocked" state, ✗ Per-transaction cap). Lower the amount and re-evaluate to pass.

**Part A ends.** Close with the signed report identifier displayed on the audit step.

---

## Part B — Dashboard tour (signed in as Admin)

1. `/dashboard` — five stat cards with 7-day trend indicators (volume, settlements, compliance
   score, agents, verified entities), plus volume-by-day, volume-by-type, and risk distribution.
2. `/dashboard/transactions` — click the **eye** icon on any row → transaction audit trail:
   full lifecycle timeline (identity → asset → rules → approval → settlement → audit),
   policy decisions, and audit hash.
3. `/dashboard/compliance` — policy rules with enabled/disabled badges, audit trail.
4. `/dashboard/reports` — generate a 30-day report with a signed audit hash.

---

## Part C — Public report (`/reports`)

Open **`/reports`** (no login). The viewer shows the report identifier, period, settled volume,
transaction count, flags, blocked, and the full **transaction validation ledger** with
`PASS / FLAGGED / REJECTED / PENDING` badges and risk scores.
