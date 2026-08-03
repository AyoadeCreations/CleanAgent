"use client";

import Link from "next/link";
import { ArrowRightIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react";
import { useDashboard } from "@/hooks/use-api";
import { formatCompactCurrency, formatNumber } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        "inline-flex items-center gap-1 font-mono text-xs font-medium",
        up ? "text-emerald-500" : "text-red-500"
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
    <Card className="transition-colors hover:border-primary/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="flex items-baseline gap-3">
              <div className="text-2xl font-semibold tracking-tight">{value}</div>
              {trend !== undefined && <Trend value={trend} isPoints={isPoints} />}
            </div>
            {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

const RISK_COLORS: Record<string, string> = {
  LOW: "bg-emerald-500",
  MEDIUM: "bg-amber-500",
  HIGH: "bg-orange-500",
  CRITICAL: "bg-red-500",
};

const TYPE_LABELS: Record<string, string> = {
  PAYMENT: "Payments",
  PAYROLL: "Payroll",
  SUPPLIER: "Suppliers",
  ESCROW: "Escrow",
  TREASURY: "Treasury",
};

export function Overview() {
  const { data, isLoading } = useDashboard();

  const o = data?.overview;
  const t = data?.trends;
  const maxDay = Math.max(1, ...(data?.volumeByDay ?? []).map((d) => d.volume));
  const maxType = Math.max(1, ...(data?.volumeByType ?? []).map((x) => x.volume));
  const maxRisk = Math.max(1, ...(data?.riskDistribution ?? []).map((r) => r.count));

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
          <CardHeader>
            <CardTitle className="text-sm font-medium">Volume · last 7 days</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="flex h-40 items-end gap-2">
                {(data?.volumeByDay ?? []).map((d) => (
                  <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="relative flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t bg-primary/70 transition-all duration-500"
                        style={{ height: `${Math.max(4, (d.volume / maxDay) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(`${d.date}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Volume by type</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="space-y-3">
                {(data?.volumeByType ?? []).map((x) => (
                  <div key={x.type} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-sm">{TYPE_LABELS[x.type] ?? x.type}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/70 transition-all duration-500"
                        style={{ width: `${(x.volume / maxType) * 100}%` }}
                      />
                    </div>
                    <span className="w-20 shrink-0 text-right font-mono text-xs">
                      {formatCompactCurrency(x.volume)}
                    </span>
                  </div>
                ))}
                {(data?.volumeByType ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No volume yet.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Risk distribution</CardTitle>
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
                      className={cn("w-full rounded-t transition-all duration-500", RISK_COLORS[r.riskLevel] ?? "bg-muted")}
                      style={{ height: `${Math.max(4, (r.count / maxRisk) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] uppercase text-muted-foreground">{r.riskLevel}</span>
                  <span className="font-mono text-xs">{r.count}</span>
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
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all transactions <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </div>
  );
}
