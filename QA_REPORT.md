# CleanFlow — QA Report (UX / UI / A11y / Mobile / States)

Audit of the product experience across the landing site, auth, onboarding, and the four role dashboards. Verified against source at `HEAD 5bfd58b`. Static analysis only — no browser automation run. Each finding lists file, what happens, and a suggested fix.

Rating scale per dimension: ✅ Solid · 🟡 Minor gaps · 🔴 Gaps worth fixing before judging.

---

## 1. Onboarding flow (`components/onboarding/onboarding-flow.tsx`)

### ✅ What's good
- Progress stepper with checkmarks; `Progress` bar reflects position.
- Account review step shows wallet/name/email (useful confirmation for a demo).
- Identity step lists the four checks, shows spinner while verifying, disables re-run once verified.
- Business step is skipped for non-BUSINESS roles; `ALREADY_EXISTS` handled by advancing.
- The "stuck on identity for already-verified users" bug was fixed in `5bfd58b` — a Continue button now appears when already verified.

### 🟡 Gaps
- **Unverified users can finish.** The Done step (lines 213-229) offers "Go to dashboard" even when `verified === false`, explicitly telling them they can continue unverified. For an identity/compliance product this undercuts the core promise.
  - Fix: gate the final Continue on `verified`, or show a "Verify to unlock payments" CTA.
- Business name has client-side check but no `maxLength`; description is a free Textarea with no cap.
- If the identity check fails (`status.verified === false`), the flow still auto-advances to the next step after the toast — a rejected user is pushed forward rather than blocked.
- No back-button navigation between steps (only forward). Minor for a linear flow.

---

## 2. Login / Register (`components/auth/login-form.tsx`, register page)

### ✅ What's good
- Clean dual path: demo chips (fast for judges) + email + wallet connect.
- Button/input disabled during submit; `submitting` state prevents double-submit; toasts surface errors.
- Wallet button disables while `connectPending`.

### 🟡 Gaps
- **Security/UX coupling:** the one-click demo chips expose admin/compliance accounts (see KNOWN_ISSUES #1). For a *demo* that's fast, but a judge on the security track will treat it as a red flag.
- **Wallet path can silently fail** on machines with no injected wallet or when `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is unset (`lib/blockchain/wallet.ts`) — `connectors[0]` may be undefined and `connectAsync` throws with a generic toast.
  - Fix: explicit "install a wallet" empty state + clearer error message.
- No `aria-describedby` linking error text to inputs (errors are toast-only, not inline). Keyboard/screen-reader users won't hear field-level errors.
- The email form has no `maxLength` or pattern beyond `type="email"`.

---

## 3. Dashboard shell (`app/dashboard/layout.tsx`, sidebar, topbar)

### ✅ What's good
- Sidebar hidden below `lg`, replaced by a Sheet mobile nav (topbar) — good responsive pattern.
- Topbar shows user initials avatar, wallet copy-to-clipboard, and logout.
- Layout redirects to `/login` when logged out; nav highlights active section.
- Focus-visible rings present on interactive primitives (base-ui).

### 🟡 Gaps
- **No role re-check** — any logged-in user can reach any role's routes (see KNOWN_ISSUES #4).
- **Hardcoded hero** on `/dashboard` ("Merchant workspace" / "Good to see you, Helios") regardless of the real user (KNOWN_ISSUES #7).
- Sidebar on `lg→xl` can feel wide for the number of items; check for truncation at 1024px with long labels.
- Copy-wallet button has no success feedback other than swapping the icon — a tooltip/toast would help.

---

## 4. Overview (`components/dashboard/overview.tsx`, `activity-feed.tsx`, `quick-actions.tsx`)

### ✅ What's good
- Stat cards with trend arrows, icons, and inline SVG sparklines (unique gradient ids via `useId` — no collisions).
- Skeleton loading grid on `/dashboard/loading.tsx` — good LCP/UX for slow data.
- QuickActions links to the main feature pages; Reports panel has a clear CTA.

### 🟡 Gaps
- **Activity feed is hardcoded and labeled "Live"** (KNOWN_ISSUES #8) — does not reflect real user data.
- **"Verified users" is a platform-wide count** shown to every role (KNOWN_ISSUES #9).
- **Empty state missing** for fresh tenants: charts render zero/blank rather than "No activity yet" (KNOWN_ISSUES #17).
- Sparklines/`reveal` don't use `useReducedMotion` (only hero/motion-reveal do) — could feel jumpy for motion-sensitive users. Minor.

---

## 5. Transactions view (`components/dashboard/transactions-view.tsx` + `/api/transaction`)

### ✅ What's good
- Client-side search, status filter, sort by date, and pagination — snappy with no extra round-trips.
- Detail dialog shows agent name, risk level, decisions.
- Loading + empty states exist; errors toast.

### 🟡 Gaps
- New-transaction dialog: **no explicit "pending→executed" feedback beyond the row appearing**; no optimistic update on create (relies on refetch — acceptable, but a toast would be nicer).
- Pagination resets when filters change (verify); if it doesn't, page numbers can exceed filtered results.
- Amount input is free-form text; large/malformed numbers validated server-side but client UX could use `inputMode="decimal"`.

---

## 6. Agents view (`agents-view.tsx` + `/api/agent`)

### ✅ What's good
- Per-agent detail: limits, permissions, status, last-used, tx count.
- Create-agent flow collects limits/permissions.
- Server enforces owner scoping (`ownerId: user.id`).

### 🟡 Gaps
- No optimistic create; no inline toggle for ACTIVE/PAUSED (requires dialog round-trip) — minor.
- Empty state present? Verify agents list shows an empty-state when none exist; if missing, add one.
- Limit inputs are plain numbers — no `min`/`step` attributes; negative values rejected only server-side.

---

## 7. Compliance view (`compliance-view.tsx` + `/api/rule`, `/api/audit`)

### ✅ What's good
- Rules CRUD with type/action/priority/enabled; audit log list restricted to COMPLIANCE/ADMIN server-side.
- Transaction review surface for oversight actions.

### 🟡 Gaps
- **Rule conditions are free-form JSON** with no per-type schema validation (KNOWN_ISSUES #12) — a judge can paste malformed conditions.
- Audit log list caps at 100 with no pagination or export — a "compliance" story usually wants export/CSV.
- Audit rows show IP but it's attacker-controlled (SECURITY #10).

---

## 8. Reports view (`reports-view.tsx` + `report-viewer.tsx` + `/api/report`)

### ✅ What's good
- Report viewer renders metrics cleanly; report hash shown (nice "signed audit trail" story).
- Generate button maps to POST `/api/report`.

### 🟡 Gaps
- **GET generates a report on every page load** (KNOWN_ISSUES #5) — the report timestamp changes on each visit and the DB grows. This is the most user-visible API smell.
- History is capped at 20 with no "load more".
- No empty-state message if history is empty beyond a plain list.

---

## 9. Landing pages (`app/page.tsx`, hero/features/testimonials/cta/use-cases)

### ✅ What's good
- Strong visual design: gradient hero, floating badge cards, trust metrics, testimonial photography, lime CTA accent.
- `Image` with explicit sizes + `loading="lazy"` on testimonials; hero is CSS/SVG (no image dependency).
- CTA links are real (`/demo`, `/register`); no dead links found.
- `useReducedMotion` respected in hero/motion-reveal entrances.

### 🟡 Gaps
- Testimonial images are remote Unsplash URLs — require network; in an offline demo the testimonials lose their faces (they have explicit dimensions via `fill` + `aspect-square`, so layout won't jump — good).
- Marketing copy mentions features (chains, agents, on-chain settlement) that are simulated in the MVP — a judge may probe "is this real?" Keep the "simulated" disclaimers visible (demo page has them).
- Hero pipeline visual cycles on an interval; pauses on hover (good), but no `prefers-reduced-motion` gating on the *interval* itself — the animation still runs, just paused on hover.

---

## 10. Accessibility (cross-cutting)

### ✅ What's good
- Base UI primitives used (dialog, menu, select, radio, sheet) — proper ARIA, focus traps, ESC-to-close, and focus-visible rings inherited.
- Form fields have `<Label htmlFor>` in onboarding/business.
- Color contrast: light theme primary text on white is strong; risk-level colors use `*-600` in light / `*-400` in dark (acceptable), status badges use translucent `*-500/10` backgrounds (contrast for text on tint is moderate).
- `alt` text present on testimonial images; decorative backgrounds use `aria-hidden`.

### 🟡 Gaps
- **Toast-only errors** — no `role="alert"` / `aria-live` wiring for field errors on login/register/dialogs (sonner does announce toasts, but inline field errors are better).
- Mobile step labels hidden (`hidden sm:inline` in onboarding) — fine, but screen readers still get labels.
- Sidebar Sheet has no visible "close" affordance for mouse users beyond clicking outside (verify sheet has an explicit close button).
- Buttons relying purely on color (e.g. status tones) should carry text; most do.

---

## 11. Mobile / responsive (320 → 1440px)

### ✅ What's good
- Dashboard: sidebar → Sheet at `<lg`; grids collapse (`sm:grid-cols-2`, `xl:grid-cols-3`); content uses `px-4 sm:px-6 lg:px-8`.
- Landing: stacks on mobile, `flex-col sm:flex-row` CTAs, images keep aspect ratio.
- Hero visual `max-w-md` scrolls fine.

### 🟡 Gaps
- **320px test not verified** — tables/cards at `min-w-*` could overflow horizontally on very narrow screens (transactions table uses responsive classes, but no explicit `overflow-x-auto` confirmed at the container level — verify).
- Topbar avatar + copy-wallet + mobile nav button may crowd on ~360px; check spacing.
- Dialogs on small screens: base-ui dialog default widths (e.g. `sm:max-w-lg`) are fine, but full-height sheets should be `h-dvh` safe — verify on iPhone SE.

---

## 12. Loading / error / empty states matrix

| View | Loading | Empty | Error | Notes |
|---|---|---|---|---|
| Landing | — | — | — | No data dependency |
| Login/Register | Button spinners | — | Toasts | No inline field errors |
| Onboarding | Verify spinner | — | Toast | Rejected identity still advances |
| Overview | ✅ skeletons | ❌ none | Toast | Zero charts look broken |
| Transactions | ✅ | ✅ | ✅ | Good baseline |
| Agents | ✅ | ⚠️ verify | Toast | Add empty state if missing |
| Compliance (rules) | ✅ | ⚠️ verify | Toast | Conditions free-form |
| Reports | ✅ | ⚠️ plain list | Toast | GET-generates-on-load bug |
| Demo | ✅ step spinners | — | Toast | Public, no auth needed |

---

## Recommended QA fixes (highest impact for judging)

1. **Gate the Reports GET** → read-only load (also fixes DB bloat). [#5]
2. **Personalize the dashboard hero** with the real user name + role label. [#7]
3. **Wire the activity feed to real audit data** or relabel it. [#8]
4. **Add empty states** to Overview charts and any missing list views. [#17]
5. **Block onboarding completion while unverified** (or clearly require it before payments). [#11]
6. **Validate rule conditions per type** server-side. [#12]
7. **Add `maxLength`/`min`/`step`** to form inputs; surface inline field errors with `aria-live`. [#18]
8. **Verify 320px overflow** on transactions/agents tables and dialogs on small phones.
