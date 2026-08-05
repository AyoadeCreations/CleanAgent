"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LandmarkIcon,
  BotIcon,
  WalletIcon,
  ReceiptIcon,
  FileBarChart2Icon,
  MoveRightIcon,
  ArrowLeftRightIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { useDashboard, useTransactions, useAgents, useBusiness, useReports } from "@/hooks/use-api";
import { formatCompactCurrency, formatNumber, formatRelativeTime, truncateAddress } from "@/lib/format";
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

export function BusinessDashboard({ userName, verified }: { userName?: string; verified: boolean }) {
  const { data, isLoading } = useDashboard();
  const { data: txData, isLoading: txLoading } = useTransactions();
  const { data: agentsData, isLoading: agentsLoading } = useAgents();
  const { data: businessData } = useBusiness();
  const { data: reportsData, isLoading: reportsLoading } = useReports();

  const o = data?.overview;
  const t = data?.trends;
  const volumeByDay = (data?.volumeByDay ?? []).map((d) => ({ v: d.volume }));
  const settlementSpark = (data?.activityByDay ?? []).map((d) => ({ v: d.settlementCount }));

  const payrollTxs = (txData?.transactions ?? []).filter((tx) => tx.type === "PAYROLL");
  const recent = (txData?.transactions ?? []).slice(0, 6);
  const activeAgents = (agentsData?.agents ?? []).filter((a) => a.status === "ACTIVE");

  const treasuryBalance = o?.totalVolume ?? 0;
  const payrollSpent = payrollTxs.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-800 to-slate-900 px-6 py-8 text-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.5)] sm:px-10 sm:py-10"
      >
        <div className="absolute -right-10 -top-12 size-48 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <p className="text-xs font-medium uppercase tracking-widest text-slate-300 sm:text-sm">
          {greeting()}, {userName ?? WORLD.business.firstName}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">{WORLD.business.name}</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base">{WORLD.business.tagline}.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge variant="outline" className="border-white/20 bg-white/10 font-mono text-white">
            <ShieldCheckIcon className="size-3" />
            {verified ? "identity verified" : "identity pending"}
          </Badge>
          <Badge variant="outline" className="border-white/20 bg-white/10 font-mono text-white">
            {businessData?.business?.status ?? "ACTIVE"}
          </Badge>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Treasury balance"
          value={treasuryBalance}
          sub="Across USDC, USDT, and T-bills"
          icon={<LandmarkIcon className="size-4.5" />}
          spark={volumeByDay}
          trend={t?.volumePercent}
          loading={isLoading}
        />
        <StatCard
          label="Payroll overview"
          value={payrollSpent}
          sub={`${payrollTxs.length} payroll runs this period`}
          icon={<ReceiptIcon className="size-4.5" />}
          spark={settlementSpark}
          trend={t?.settlementsPercent}
          loading={isLoading}
          sparkColor="#8b5cf6"
        />
        <StatCard
          label="Active agents"
          value={activeAgents.length}
          sub="Agents executing within limits"
          icon={<BotIcon className="size-4.5" />}
          trend={t?.agentsPercent}
          loading={agentsLoading}
          sparkColor="#10b981"
        />
        <StatCard
          label="Compliance score"
          value={o?.complianceScore ?? 0}
          sub="Out of 100 · rolling"
          icon={<ShieldCheckIcon className="size-4.5" />}
          trend={t?.complianceDelta}
          loading={isLoading}
          sparkColor="#f59e0b"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard icon={<WalletIcon className="size-4 text-primary" />} title="Treasury position" actionLabel="View" href="/dashboard/transactions">
          <dl className="mt-4 grid gap-2">
            <Row label="Total volume" value={formatCompactCurrency(o?.totalVolume ?? 0)} />
            <Row label="Settlements" value={formatNumber(o?.settlements ?? 0, 0)} />
            <Row label="Pending review" value={formatNumber(o?.pendingCount ?? 0, 0)} />
            <Row label="Blocked by policy" value={formatNumber(o?.blockedCount ?? 0, 0)} />
          </dl>
        </SectionCard>
        <SectionCard icon={<BotIcon className="size-4 text-primary" />} title="Active agents" actionLabel="Manage" href="/dashboard/agents">
          <div className="mt-4 space-y-2.5">
            {agentsLoading ? (
              <Skeleton className="h-28 w-full" />
            ) : activeAgents.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No active agents.</p>
            ) : (
              activeAgents.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border bg-background/60 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(a.dailyLimit, 0)}/day · {formatNumber(a.monthlyLimit, 0)}/mo
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-500">
                    <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                    active
                  </span>
                </div>
              ))
            )}
          </div>
        </SectionCard>
        <SectionCard icon={<FileBarChart2Icon className="size-4 text-primary" />} title="Recent reports" actionLabel="Reports" href="/dashboard/reports">
          <div className="mt-4 space-y-2.5">
            {reportsLoading ? (
              <Skeleton className="h-28 w-full" />
            ) : (reportsData?.reports ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No reports generated yet.</p>
            ) : (
              (reportsData?.reports ?? []).slice(0, 4).map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border bg-background/60 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs">{truncateAddress(r.reportHash, 10, 6)}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(r.createdAt)}</p>
                  </div>
                  <span className="font-mono text-xs text-emerald-500">signed</span>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <Card>
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <ArrowLeftRightIcon className="size-4 text-primary" />
            <h3 className="text-sm font-medium">Supplier & payroll activity</h3>
          </div>
          <Link href="/dashboard/transactions" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
            View all <MoveRightIcon className="size-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Agent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-20 w-full" />
                  </TableCell>
                </TableRow>
              ) : recent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                    No activity yet.
                  </TableCell>
                </TableRow>
              ) : (
                recent.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{truncateAddress(t.receiver)}</TableCell>
                    <TableCell className="text-xs uppercase text-muted-foreground">{t.type}</TableCell>
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
                    <TableCell className="text-xs text-muted-foreground">{t.agentName ?? "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
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

function SectionCard({
  icon,
  title,
  actionLabel,
  href,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  actionLabel: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] bg-card p-5 ring-1 ring-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        <Link href={href} className="text-xs font-medium text-primary hover:text-primary/80">
          {actionLabel}
        </Link>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-background/60 px-3 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-xs font-medium tabular-nums">{value}</span>
    </div>
  );
}
