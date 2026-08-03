"use client";

import Link from "next/link";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  MoveRightIcon,
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
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  isPoints?: boolean;
  loading?: boolean;
}) {
  return (
    <Card className="group transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_10px_30px_-16px_rgba(37,99,235,0.35)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="flex items-baseline gap-3">
              <div className="text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
              {trend !== undefined && <Trend value={trend} isPoints={isPoints} />}
            </div>
            {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
          </>
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total transaction volume"
          value={isLoading ? "" : formatCompactCurrency(o?.totalVolume ?? 0)}
          sub="Settled + approved volume"
          trend={t?.volumePercent}
          loading={isLoading}
        />
        <StatCard
          label="Completed settlements"
          value={isLoading ? "" : formatNumber(o?.settlements ?? 0, 0)}
          sub={`${formatNumber(o?.pendingCount ?? 0, 0)} pending review`}
          trend={t?.settlementsPercent}
          loading={isLoading}
        />
        <StatCard
          label="Compliance score"
          value={isLoading ? "" : `${o?.complianceScore ?? 0}`}
          sub="Out of 100 · this week"
          trend={t?.complianceDelta}
          isPoints
          loading={isLoading}
        />
        <StatCard
          label="Active agents"
          value={isLoading ? "" : formatNumber(o?.activeAgents ?? 0, 0)}
          sub="Agents executing payments"
          trend={t?.agentsPercent}
          loading={isLoading}
        />
        <StatCard
          label="Verified entities"
          value={isLoading ? "" : formatNumber(o?.verifiedUsers ?? 0, 0)}
          sub="Passed CVI identity checks"
          trend={t?.verifiedPercent}
          loading={isLoading}
        />
        <StatCard
          label="Transactions"
          value={isLoading ? "" : formatNumber(o?.transactionCount ?? 0, 0)}
          sub={`${formatNumber(o?.blockedCount ?? 0, 0)} blocked by policy`}
          trend={t?.transactionsPercent}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Volume · last 7 days</CardTitle>
            <CardDescription className="text-xs">Daily settled volume in USD</CardDescription>
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
            <CardTitle className="text-sm font-medium">Compliance score · last 7 days</CardTitle>
            <CardDescription className="text-xs">Rolling score out of 100</CardDescription>
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
                      name="Compliance"
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
            <CardTitle className="text-sm font-medium">Settlements vs blocked</CardTitle>
            <CardDescription className="text-xs">Daily transaction outcomes</CardDescription>
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
                    <Bar dataKey="settled" name="Settled" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={10} />
                    <Bar dataKey="blocked" name="Blocked" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={10} />
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
          <CardTitle className="text-sm font-medium">Risk distribution</CardTitle>
          <CardDescription className="text-xs">Scored transactions by risk level</CardDescription>
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
                  <span className="text-[10px] uppercase text-muted-foreground">{r.riskLevel}</span>
                  <span className="font-mono text-xs tabular-nums">{r.count}</span>
                </div>
              ))}
              {(data?.riskDistribution ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No transactions scored yet.</p>
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
