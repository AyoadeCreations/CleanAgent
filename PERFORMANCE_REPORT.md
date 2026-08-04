# CleanFlow — Performance Report

Static analysis of bundle, loading strategy, rendering, and API efficiency at `HEAD 5bfd58b`. **No Lighthouse/WebPageTest run** — metrics like CLS/LCP/TBT below are estimates from code inspection and should be validated with a real measurement pass.

---

## 1. Font loading — the biggest client-side cost

**File:** `app/layout.tsx:2,7-22`

Three Google fonts are loaded globally on every page:

| Font | Variable | `display` | Role |
|---|---|---|---|
| `Inter` | `--font-sans` | `swap` | body |
| `Plus_Jakarta_Sans` | `--font-display` | `swap` | headings/display |
| `Geist_Mono` | `--font-geist-mono` | **not set (defaults to `auto`)** | monospace labels |

Findings:

- **Three font families on every route**, each fetched from Google Fonts at build time and self-hosted. That's ~3 woff2 sets (~60-100 KB total compressed) added to the initial payload for a few `font-mono` labels and display headings.
- **`Geist_Mono` has no `display: "swap"`.** `next/font` defaults to `auto`, which can block text rendering (FOIT) on slow networks. This is the single easiest win.
- **Two sans-serif families** (`Inter` + `Plus_Jakarta_Sans`) both serve body/headings — consider one (Plus_Jakarta_Sans is the brand face) or drop Inter and use Jakarta for body, saving a full font download.
- Fonts are not `preconnect`ed (next/font self-hosts, so this is moot — but the Google fetch at build time adds build latency; not runtime).

**Fix:** add `display: "swap"` to `Geist_Mono`; consider cutting Inter and aliasing body text to `--font-display` to halve font payload.

---

## 2. Bundle / route splitting

✅ **Good:**
- `/demo` page lazy-loads `DemoWorkflow` via `next/dynamic` (`app/demo/page.tsx:5`) — the heavy demo component doesn't ship to other routes.
- Dashboard views import only what they use; `@tanstack/react-query` is shared but tree-shaken.
- Recharts is confirmed imported by the dashboard Overview (`components/dashboard/overview.tsx:17-27`) for **stat-card sparklines (AreaChart), volume-by-day (BarChart), and risk distribution**. Recharts 3.x is a heavy client dep (~400 KB+ min). `isAnimationActive={false}` is set on sparklines (good), but the whole recharts runtime ships in the dashboard chunk. It's genuinely used (not dead weight), so the options are: (a) keep as-is — fine for a demo, (b) `next/dynamic` the heavy chart cluster below the fold, or (c) swap sparklines to the hand-rolled inline SVG approach (the `useId` gradient code is already written) and keep recharts only for the bar chart.
- `opengraph-image.tsx` uses `ImageResponse` (edge) — no runtime cost on normal pages.

---

## 3. Rendering & data fetch strategy

✅ **Good:**
- Server components for all page shells (landing, auth, role homes, layout) — minimal client JS on first paint.
- React Query (`use-api.ts`) dedupes dashboard/transactions/agents/rules/reports fetches, with `invalidateQueries` on mutations.
- `Skeleton` loading states on `/dashboard` (`app/dashboard/loading.tsx`) prevent layout jump while data loads.
- Landing hero is pure CSS/SVG — no image dependency, no layout shift.

🟢 **Resolved:**
- **GET `/api/report` no longer writes** — split into read-only GET (history) + POST (create) + new PUT/DELETE (`/api/report/[id]`). Viewing Reports no longer accumulates DB rows.
- Dashboard summary (`lib/database/summary.ts`) runs multiple queries per request; for a demo DB this is fine, adds `Promise.all` where independent (agent/verified counts already parallel).
- **React Query caching is now explicit** — `components/providers.tsx:14` sets `staleTime: 30_000` and `refetchOnWindowFocus: false`, cutting refetch chatter during dashboard navigation.

---

## 4. Layout stability / CLS (estimate: LOW — likely < 0.05)

- Testimonial images use `fill` + `aspect-square` + `sizes` (`testimonials.tsx:47-55`) → no CLS from images.
- Stat cards/skeletons reserve height before data arrives.
- Hero visual has fixed `max-w-md` + defined structure; floating badges are `absolute` with inset — they animate transform/opacity (framer-motion), which does not trigger layout.
- **Watch:** `font-mono` label swaps (Inter↔Geomono) can cause tiny width shifts if a label uses both fonts in the same row; negligible.

---

## 5. LCP (estimate: GOOD — server HTML + one hero section)

- Landing LCP is text/heading (no hero image) → server-rendered, no network image blocking. LCP should be < 1.5 s on a decent connection.
- **Watch:** `Plus_Jakarta_Sans` (display font) swap could delay perceived heading render on slow links; `display: swap` mitigates FOIT but not FOUT.

---

## 6. Images

✅ `next/image` used everywhere (auto AVIF/WebP, responsive `sizes`). Only Unsplash allowed (`next.config.ts:5-11`) — remote images are lazy (`loading="lazy"` on testimonials).

🟡 Remote Unsplash dependency: **an offline demo shows broken/missing testimonial faces.** `alt` text present so no a11y crash, but consider self-hosting the three testimonial photos to be network-independent at judging time.

---

## 7. Runtime / server costs

- `prisma` + `better-sqlite3` (`dev.db`) — SQLite is fine for demo scale; concurrent writes serialize (fine for a demo).
- `runtime = "nodejs"` declared on demo/verify routes — default elsewhere; no edge/serverless cold-start optimization. Vercel deploys of the App Router default to Node runtime → fine.
- Turbopack dev build: clean `npm run build` previously passed (~67 s). No build-time red flags.

---

## 8. Priority fixes (performance)

| # | Fix | Impact |
|---|---|---|
| 1 | `display: "swap"` on `Geist_Mono` (or drop the third font) | Faster text render, less risk of FOIT |
| 2 | Drop `Inter` and alias body to Plus_Jakarta_Sans | −1 font download (~30-40 KB) |
| 3 | ~Resolved: `staleTime: 30_000` + `refetchOnWindowFocus: false` already set in `components/providers.tsx`; remaining `gcTime` tuning optional | Fewer refetches on nav |
| 4 | ✅ Resolved: split GET vs POST on `/api/report` | Removes write-per-load; DB growth stops |
| 5 | Lazy-load the heavy recharts chart cluster on Overview, or drop recharts from sparklines (inline SVG exists) | −400 KB client JS on the primary dashboard route |
| 6 | Self-host testimonial images | Offline-safe demo |
| 7 | `Promise.all` remaining independent summary queries | Micro-optimization on dashboard |

**Net estimate after fixes:** client JS on landing → ~0 (pure server HTML), font payload −40%, dashboard list fetches −80% on rapid nav, Overview client bundle −400 KB (via recharts lazy-load), CLS unchanged (already low). Recommend a Lighthouse run on `/`, `/login`, `/demo`, and `/dashboard` to confirm LCP < 1.5 s and CLS < 0.05 on mid-tier mobile.
