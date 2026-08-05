"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  WalletIcon,
  CheckCircle2Icon,
  ShieldCheckIcon,
  Clock3Icon,
  ArrowLeftRightIcon,
  LandmarkIcon,
  FingerprintIcon,
  FileCheck2Icon,
  ScaleIcon,
  MoveRightIcon,
  BoxesIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { StatCard } from "@/components/dashboard/stat-card";
import { useDashboard, useTransactions } from "@/hooks/use-api";
import { formatCompactCurrency, formatNumber, formatDateTime, truncateAddress } from "@/lib/format";
import { WORLD, greeting } from "@/lib/world";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface TooltipItem {
  dataKey?: string | number;
  name?: string;
  value?: string | number;
}

function ChartTip({ active, payload, label }: { active?: boolean; payload?: TooltipItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-muted-foreground">{label}</p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="font-mono font-medium tabular-nums">
          {p.name}: {formatCompactCurrency(Number(p.value))}
        </p>
      ))}
    </div>
  );
}

function ScoreTip({ active, payload, label }: { active?: boolean; payload?: TooltipItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-muted-foreground">{label}</p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="font-mono font-medium tabular-nums">
          {p.name}: {p.dataKey === "score" ? `${p.value}/100` : p.value}
        </p>
      ))}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  APPROVED: "bg-sky-500/10 text-sky-500 border-sky-500/30",
  EXECUTED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  SUSPENDED: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  BLOCKED: "bg-red-500/10 text-red-500 border-red-500/30",
  FAILED: "bg-rose-500/10 text-rose-500 border-rose-500/30",
};

const RISK_STYLES: Record<string, string> = {
  LOW: "bg-emerald-500/10 text-emerald-500",
  MEDIUM: "bg-amber-500/10 text-amber-500",
  HIGH: "bg-orange-500/10 text-orange-500",
  CRITICAL: "bg-red-500/10 text-red-500",
};

export function MerchantDashboard({
  userName,
  verified,
}: {
  userName?: string;
  verified: boolean;
}) {
  const { data, isLoading } = useDashboard();
  const { data: txData, isLoading: txLoading } = useTransactions();

  const o = data?.overview;
  const t = data?.trends;

  const volumeByDay = (data?.volumeByDay ?? []).map((d) => ({
    label: new Date(`${d.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    volume: d.volume,
  }));

  const settlementByDay = (data?.activityByDay ?? []).map((d) => ({
    label: new Date(`${d.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    count: d.settlementCount,
  }));

  const approvalByDay = (data?.activityByDay ?? []).map((d) => {
    const total = d.settlementCount + d.blockedCount || 1;
    return {
      label: new Date(`${d.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      rate: Math.round((d.settlementCount / total) * 100),
    };
  });

  const complianceByDay = (data?.activityByDay ?? []).map((d) => {
    const total = d.settlementCount + d.blockedCount;
    const score = total === 0 ? 100 : Math.max(0, Math.round(100 - (d.blockedCount / total) * 60 - d.avgRisk / 2));
    return {
      label: new Date(`${d.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score,
    };
  });

  const volumeSpark = (data?.volumeByDay ?? []).map((d) => ({ v: d.volume }));
  const settlementSpark = (data?.activityByDay ?? []).map((d) => ({ v: d.settlementCount }));
  const complianceSpark = complianceByDay.map((d) => ({ v: d.score }));
  const approvalSpark = approvalByDay.map((d) => ({ v: d.rate }));

  const first = WORLD.merchant.firstName;
  const transactions = (txData?.transactions ?? []).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-8 text-white shadow-[0_20px_50px_-20px_rgba(37,99,235,0.5)] sm:px-10 sm:py-10"
      >
        <div className="absolute -right-10 -top-12 size-48 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="absolute right-16 bottom-0 h-32 w-32 rounded-t-full bg-white/10" aria-hidden="true" />
        <p className="text-xs font-medium uppercase tracking-widest text-blue-100 sm:text-sm">
          {greeting()}, {userName ?? first}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
          {WORLD.merchant.name}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-blue-50 sm:text-base">
          {WORLD.merchant.tagline}. Your settlements, compliance, and payments in one trusted place.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge variant="outline" className="border-white/20 bg-white/10 font-mono text-white">
            <ShieldCheckIcon className="size-3" />
            {verified ? "identity verified" : "identity pending"}
          </Badge>
          <Badge variant="outline" className="border-white/20 bg-white/10 font-mono text-white">
            <CheckCircle2Icon className="size-3" />
            live
          </Badge>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's settlements"
          value={o?.settlements ?? 0}
          sub="Settled this billing period"
          icon={<LandmarkIcon className="size-4.5" />}
          spark={settlementSpark}
          trend={t?.settlementsPercent}
          loading={isLoading}
        />
        <StatCard
          label="Escrow balance"
          value={o?.settlements ?? 0}
          sub="Held pending confirmation"
          icon={<WalletIcon className="size-4.5" />}
          spark={approvalSpark}
          trend={t?.volumePercent}
          loading={isLoading}
          sparkColor="#8b5cf6"
        />
        <StatCard
          label="Compliance score"
          value={o?.complianceScore ?? 0}
          sub="Out of 100 · rolling"
          icon={<ShieldCheckIcon className="size-4.5" />}
          spark={complianceSpark}
          trend={t?.complianceDelta}
          loading={isLoading}
          sparkColor="#10b981"
        />
        <StatCard
          label="Pending transactions"
          value={o?.pendingCount ?? 0}
          sub={`${o?.transactionCount ?? 0} total this period`}
          icon={<Clock3Icon className="size-4.5" />}
          spark={volumeSpark}
          trend={t?.transactionsPercent}
          loading={isLoading}
          sparkColor="#f59e0b"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHead title="Transaction volume" sub="Daily settled volume in USD" />
          <div className="p-5 pt-0">
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : volumeByDay.length ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeByDay} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="mvolFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} dy={6} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => formatCompactCurrency(v)} />
                    <Tooltip content={<ChartTip />} cursor={{ stroke: "var(--border)" }} />
                    <Area type="monotone" dataKey="volume" name="Volume" stroke="#2563eb" strokeWidth={2} fill="url(#mvolFill)" activeDot={{ r: 4, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-10 text-sm text-muted-foreground">No volume yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHead title="Settlement chart" sub="Completed settlements per day" />
          <div className="p-5 pt-0">
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : settlementByDay.length ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={settlementByDay} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} dy={6} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={30} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                    <Bar dataKey="count" name="Settled" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-10 text-sm text-muted-foreground">No settlements yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHead title="Approval chart" sub="Settlement approval rate · %" />
          <div className="p-5 pt-0">
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : approvalByDay.length ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={approvalByDay} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="mappFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} dy={6} />
                    <YAxis domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={40} />
                    <Tooltip content={<ScoreTip />} cursor={{ stroke: "var(--border)" }} />
                    <Area type="monotone" dataKey="rate" name="Approval" stroke="#8b5cf6" strokeWidth={2} fill="url(#mappFill)" activeDot={{ r: 4, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-10 text-sm text-muted-foreground">No approvals yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHead title="Compliance chart" sub="Rolling compliance score · out of 100" />
          <div className="p-5 pt-0">
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : complianceByDay.length ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={complianceByDay} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="mcompFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} dy={6} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={30} />
                    <Tooltip content={<ScoreTip />} cursor={{ stroke: "var(--border)" }} />
                    <Area type="monotone" dataKey="score" name="Compliance" stroke="#10b981" strokeWidth={2} fill="url(#mcompFill)" activeDot={{ r: 4, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-10 text-sm text-muted-foreground">No activity yet.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <ArrowLeftRightIcon className="size-4 text-primary" />
            <h3 className="text-sm font-medium">Recent settlements</h3>
          </div>
          <Link href="/dashboard/transactions" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
            View all <MoveRightIcon className="size-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sender</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-20 w-full" />
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                    No settlements yet.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{truncateAddress(t.sender)}</TableCell>
                    <TableCell className="font-mono text-xs">{truncateAddress(t.receiver)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {formatNumber(t.amount)} {t.assetType}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("font-mono", STATUS_STYLES[t.status])}>
                        {t.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("font-mono", RISK_STYLES[t.riskLevel] ?? "")}>
                        {t.riskLevel.toLowerCase()} · {t.riskScore}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(t.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Activity feed */}
      <LifecycleFeed loading={isLoading} />
    </div>
  );
}

function CardHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="p-5 pb-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

const FEED = [
  { icon: FingerprintIcon, title: "Identity verified", detail: "BluePeak Logistics · CVI attestation", tone: "text-emerald-600" },
  { icon: BoxesIcon, title: "Asset verified", detail: "USDC · USDT · T-bills collateral screened", tone: "text-emerald-600" },
  { icon: ScaleIcon, title: "Compliance checks completed", detail: "CCP policy evaluated · 4/4 passed", tone: "text-amber-600" },
  { icon: LandmarkIcon, title: "Settlement completed", detail: "Funds released on-chain", tone: "text-blue-600" },
  { icon: FileCheck2Icon, title: "Audit report generated", detail: "Signed hash recorded to the ledger", tone: "text-rose-600" },
];

function LifecycleFeed({ loading }: { loading?: boolean }) {
  return (
    <div className="rounded-[24px] bg-card p-6 ring-1 ring-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)] sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Activity feed</h3>
          <p className="mt-1 text-sm text-muted-foreground">Latest lifecycle across your workspace</p>
        </div>
        <Badge variant="outline" className="gap-1.5 text-emerald-600">
          <CheckCircle2Icon className="size-3.5" />
          Live
        </Badge>
      </div>
      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <ol className="relative">
          {FEED.map((event, i) => (
            <li key={event.title} className="relative flex gap-4 pb-6 last:pb-0">
              {i < FEED.length - 1 && (
                <span className="absolute top-7 left-[15px] h-[calc(100%-20px)] w-px bg-border" aria-hidden="true" />
              )}
              <span className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted ${event.tone}`}>
                <event.icon className="size-4" />
              </span>
              <div className="min-w-0 pt-1">
                <p className="text-sm font-medium">{event.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{event.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}