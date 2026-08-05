"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  MoveRightIcon,
  WalletIcon,
  LandmarkIcon,
  ShieldCheckIcon,
  BotIcon,
  UsersIcon,
  ArrowLeftRightIcon,
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
import { useDashboard } from "@/hooks/use-api";
import { formatCompactCurrency, formatNumber } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function Trend({ value, isPoints = false }: { value: number; isPoints?: boolean }) {
  const suffix = isPoints ? " pts" : "%";
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
        <MinusIcon className="size-3" />
        {value}
        {suffix}
      </span>
    );
  }
  const up = value > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-xs font-medium ring-1",
        up ? "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20" : "bg-red-500/10 text-red-500 ring-red-500/20"
      )}
    >
      {up ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
      {up ? "+" : ""}
      {value}
      {suffix}
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
  trend,
  isPoints,
  loading,
  icon,
  spark,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  isPoints?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  spark?: Array<{ v: number }>;
}) {
  const gradientId = React.useId();
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary/8 text-primary">
            {icon}
          </span>
          {trend !== undefined && <Trend value={trend} isPoints={isPoints} />}
        </div>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
            </div>
          </>
        )}
        {!loading && spark && spark.length > 0 && (
          <div className="h-10 w-full -mx-8 mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spark} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#2563eb"
                  strokeWidth={1.5}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TooltipPayloadItem {
  dataKey?: string | number;
  name?: string;
  value?: string | number;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
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

function ValueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
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

const TYPE_LABELS: Record<string, string> = {
  PAYMENT: "Payments",
  PAYROLL: "Payroll",
  SUPPLIER: "Suppliers",
  ESCROW: "Escrow",
  TREASURY: "Treasury",
};

const RISK_COLORS: Record<string, string> = {
  LOW: "bg-emerald-500",
  MEDIUM: "bg-amber-500",
  HIGH: "bg-orange-500",
  CRITICAL: "bg-red-500",
};

const RISK_LABELS: Record<string, string> = {
  LOW: "Passed",
  MEDIUM: "Passed",
  HIGH: "Needs review",
  CRITICAL: "Needs review",
};

export function Overview() {
  const { data, isLoading } = useDashboard();

  const o = data?.overview;
  const t = data?.trends;
  const maxRisk = Math.max(1, ...(data?.riskDistribution ?? []).map((r) => r.count));

  const volumeByDay = (data?.volumeByDay ?? []).map((d) => ({
    label: new Date(`${d.date}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    volume: d.volume,
  }));

  const volumeByType = (data?.volumeByType ?? []).map((x) => ({
    label: TYPE_LABELS[x.type] ?? x.type,
    volume: x.volume,
  }));

  const settlementByDay = (data?.activityByDay ?? []).map((d) => ({
    label: new Date(`${d.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    settled: d.settlementCount,
    blocked: d.blockedCount,
  }));

  const complianceByDay = (data?.activityByDay ?? []).map((d) => {
    const total = d.settlementCount + d.blockedCount;
    const compliance = total === 0 ? 100 : Math.max(0, Math.round(100 - (d.blockedCount / total) * 60 - d.avgRisk / 2));
    return {
      label: new Date(`${d.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: compliance,
    };
  });

  const volumeSpark = (data?.volumeByDay ?? []).map((d) => ({ v: d.volume }));
  const settlementSpark = (data?.activityByDay ?? []).map((d) => ({ v: d.settlementCount }));
  const complianceSpark = complianceByDay.map((d) => ({ v: d.score }));
  const riskSpark = (data?.riskDistribution ?? []).map((r) => ({ v: r.count }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total payment volume"
          value={isLoading ? "" : formatCompactCurrency(o?.totalVolume ?? 0)}
          sub="Sent + approved"
          icon={<WalletIcon className="size-4.5" />}
          spark={volumeSpark}
          trend={t?.volumePercent}
          loading={isLoading}
        />
        <StatCard
          label="Completed payments"
          value={isLoading ? "" : formatNumber(o?.settlements ?? 0, 0)}
          sub={`${formatNumber(o?.pendingCount ?? 0, 0)} awaiting approval`}
          icon={<LandmarkIcon className="size-4.5" />}
          spark={settlementSpark}
          trend={t?.settlementsPercent}
          loading={isLoading}
        />
        <StatCard
          label="Account health"
          value={isLoading ? "" : `${o?.complianceScore ?? 0}`}
          sub="Out of 100 · this week"
          icon={<ShieldCheckIcon className="size-4.5" />}
          spark={complianceSpark}
          trend={t?.complianceDelta}
          isPoints
          loading={isLoading}
        />
        <StatCard
          label="Active automations"
          value={isLoading ? "" : formatNumber(o?.activeAgents ?? 0, 0)}
          sub="Automations sending payments"
          icon={<BotIcon className="size-4.5" />}
          spark={riskSpark}
          trend={t?.agentsPercent}
          loading={isLoading}
        />
        <StatCard
          label="Verified businesses"
          value={isLoading ? "" : formatNumber(o?.verifiedUsers ?? 0, 0)}
          sub="Passed business verification"
          icon={<UsersIcon className="size-4.5" />}
          trend={t?.verifiedPercent}
          loading={isLoading}
        />
        <StatCard
          label="Payments"
          value={isLoading ? "" : formatNumber(o?.transactionCount ?? 0, 0)}
          sub={`${formatNumber(o?.blockedCount ?? 0, 0)} declined by safety checks`}
          icon={<ArrowLeftRightIcon className="size-4.5" />}
          trend={t?.transactionsPercent}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Money sent · last 7 days</CardTitle>
            <CardDescription className="text-xs">Daily payment volume in USD</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : volumeByDay.length ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeByDay} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={false}
                      dy={6}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={false}
                      width={48}
                      tickFormatter={(v: number) => formatCompactCurrency(v)}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)" }} />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      name="Volume"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fill="url(#volumeFill)"
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-10 text-sm text-muted-foreground">No volume yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Volume by type</CardTitle>
            <CardDescription className="text-xs">Where funds are moving</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : volumeByType.length ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeByType} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={84}
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "rgba(148,163,184,0.08)" }}
                    />
                    <Bar dataKey="volume" name="Volume" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-10 text-sm text-muted-foreground">No volume yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Account health · last 7 days</CardTitle>
            <CardDescription className="text-xs">Rolling account health out of 100</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : complianceByDay.length ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={complianceByDay} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={false}
                      dy={6}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={false}
                      width={30}
                    />
                    <Tooltip content={<ValueTooltip />} cursor={{ stroke: "var(--border)" }} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      name="Account health"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#scoreFill)"
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-10 text-sm text-muted-foreground">No activity yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed vs declined</CardTitle>
            <CardDescription className="text-xs">Daily payment outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : settlementByDay.length ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={settlementByDay} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={false}
                      dy={6}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={false}
                      width={30}
                    />
                    <Tooltip content={<ValueTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                    <Bar dataKey="settled" name="Completed" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={10} />
                    <Bar dataKey="blocked" name="Declined" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={10} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-10 text-sm text-muted-foreground">No activity yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

        <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Payment safety overview</CardTitle>
          <CardDescription className="text-xs">Payments by review outcome</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="flex h-24 items-end gap-4">
              {(data?.riskDistribution ?? []).map((r) => (
                <div key={r.riskLevel} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="relative flex w-full flex-1 items-end">
                    <div
                      className={cn(
                        "w-full rounded-t-lg transition-all duration-500",
                        RISK_COLORS[r.riskLevel] ?? "bg-muted"
                      )}
                      style={{ height: `${Math.max(4, (r.count / maxRisk) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] uppercase text-muted-foreground">{RISK_LABELS[r.riskLevel] ?? r.riskLevel}</span>
                  <span className="font-mono text-xs tabular-nums">{r.count}</span>
                </div>
              ))}
              {(data?.riskDistribution ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No payments reviewed yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Link
          href="/dashboard/transactions"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all transactions
          <MoveRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
