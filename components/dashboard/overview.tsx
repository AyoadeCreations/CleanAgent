"use client";

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { useDashboard } from "@/hooks/use-api";
import { formatCompactCurrency, formatCurrency, formatNumber } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  sub,
  loading,
}: {
  label: string;
  value: string;
  sub?: string;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-semibold tracking-tight">{value}</div>
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
  const maxDay = Math.max(1, ...(data?.volumeByDay ?? []).map((d) => d.volume));
  const maxType = Math.max(1, ...(data?.volumeByType ?? []).map((t) => t.volume));
  const maxRisk = Math.max(1, ...(data?.riskDistribution ?? []).map((r) => r.count));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total volume"
          value={isLoading ? "" : formatCompactCurrency(o?.totalVolume ?? 0)}
          sub={isLoading ? undefined : "Executed + approved"}
          loading={isLoading}
        />
        <StatCard
          label="Transactions"
          value={isLoading ? "" : formatNumber(o?.transactionCount ?? 0, 0)}
          sub={isLoading ? undefined : `${formatNumber(o?.pendingCount ?? 0, 0)} pending`}
          loading={isLoading}
        />
        <StatCard
          label="Active agents"
          value={isLoading ? "" : formatNumber(o?.activeAgents ?? 0, 0)}
          loading={isLoading}
        />
        <StatCard
          label="Verified users"
          value={isLoading ? "" : formatNumber(o?.verifiedUsers ?? 0, 0)}
          loading={isLoading}
        />
        <StatCard
          label="Blocked"
          value={isLoading ? "" : formatNumber(o?.blockedCount ?? 0, 0)}
          sub={isLoading ? undefined : "Flagged by CCP"}
          loading={isLoading}
        />
        <StatCard
          label="Compliance score"
          value={isLoading ? "" : `${o?.complianceScore ?? 0}`}
          sub={isLoading ? undefined : "Out of 100"}
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
                        className="w-full rounded-t bg-primary/70"
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
                {(data?.volumeByType ?? []).map((t) => (
                  <div key={t.type} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-sm">{TYPE_LABELS[t.type] ?? t.type}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${(t.volume / maxType) * 100}%` }}
                      />
                    </div>
                    <span className="w-20 shrink-0 text-right font-mono text-xs">
                      {formatCompactCurrency(t.volume)}
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
                      className={cn("w-full rounded-t", RISK_COLORS[r.riskLevel] ?? "bg-muted")}
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
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          View all transactions <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </div>
  );
}
