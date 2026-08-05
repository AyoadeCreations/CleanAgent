"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BanIcon,
  FlagIcon,
  ShieldCheckIcon,
  FileBarChart2Icon,
  GaugeIcon,
  Globe2Icon,
  MoveRightIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { useDashboard, useTransactions, useAuditLogs, useReports } from "@/hooks/use-api";
import { formatNumber, formatRelativeTime, truncateAddress } from "@/lib/format";
import { WORLD, COMPLIANCE_OFFICERS, greeting } from "@/lib/world";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function ComplianceDashboard({ userName, verified }: { userName?: string; verified: boolean }) {
  const { data, isLoading } = useDashboard();
  const { data: txData, isLoading: txLoading } = useTransactions();
  const { data: auditData, isLoading: auditLoading } = useAuditLogs();
  const { data: reportsData, isLoading: reportsLoading } = useReports();

  const o = data?.overview;
  const t = data?.trends;
  const riskDist = data?.riskDistribution ?? [];
  const riskSpark = riskDist.map((r) => ({ v: r.count }));
  const activitySpark = (data?.activityByDay ?? []).map((d) => ({ v: d.blockedCount }));
  const scoreSpark = (data?.activityByDay ?? []).map((d) => {
    const total = d.settlementCount + d.blockedCount;
    return { v: total === 0 ? 100 : Math.max(0, Math.round(100 - (d.blockedCount / total) * 60 - d.avgRisk / 2)) };
  });

  const blocked = (txData?.transactions ?? []).filter((t) => t.status === "BLOCKED" || t.status === "FAILED");
  const flagged = (txData?.transactions ?? []).filter((t) => t.riskLevel === "HIGH" || t.riskLevel === "CRITICAL" || t.status === "SUSPENDED");

  const maxRisk = Math.max(1, ...riskDist.map((r) => r.count));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-emerald-600 to-teal-700 px-6 py-8 text-white shadow-[0_20px_50px_-20px_rgba(16,185,129,0.5)] sm:px-10 sm:py-10"
      >
        <div className="absolute -right-10 -top-12 size-48 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <p className="text-xs font-medium uppercase tracking-widest text-emerald-100 sm:text-sm">
          {greeting()}, {userName ?? WORLD.compliance.firstName}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">{WORLD.compliance.name}</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-emerald-50 sm:text-base">{WORLD.compliance.tagline}.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
            <ShieldCheckIcon className="size-3" />
            {verified ? "Verified business" : "Verification pending"}
          </Badge>
          <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
            <CheckCircle2Icon className="size-3" />
            activity history live
          </Badge>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Declined payments"
          value={o?.blockedCount ?? 0}
          sub="Stopped by your account's safety checks"
          icon={<BanIcon className="size-4.5" />}
          spark={activitySpark}
          trend={t?.transactionsPercent}
          loading={isLoading}
          sparkColor="#ef4444"
        />
        <StatCard
          label="Needs review"
          value={flagged.length}
          sub="Payments that need attention"
          icon={<FlagIcon className="size-4.5" />}
          spark={riskSpark}
          trend={t?.settlementsPercent}
          loading={txLoading}
          sparkColor="#f59e0b"
        />
        <StatCard
          label="Activity history"
          value={(reportsData?.reports ?? []).length}
          sub="Records ready to export"
          icon={<FileBarChart2Icon className="size-4.5" />}
          loading={reportsLoading}
          sparkColor="#8b5cf6"
        />
        <StatCard
          label="Account health"
          value={o?.complianceScore ?? 0}
          sub="Account health · /100"
          icon={<GaugeIcon className="size-4.5" />}
          spark={scoreSpark}
          trend={t?.complianceDelta}
          loading={isLoading}
          sparkColor="#10b981"
        />
      </div>

      {/* Risk distribution */}
      <div className="rounded-[20px] bg-card p-5 ring-1 ring-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2">
          <GaugeIcon className="size-4 text-primary" />
          <h3 className="text-sm font-medium">Payment safety overview</h3>
        </div>
        {isLoading ? (
          <Skeleton className="mt-4 h-20 w-full" />
        ) : (
          <div className="mt-4 flex h-24 items-end gap-4">
            {riskDist.map((r) => (
              <div key={r.riskLevel} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="relative flex w-full flex-1 items-end">
                  <div
                    className={cn("w-full rounded-t-lg transition-all duration-500", RISK_COLORS[r.riskLevel] ?? "bg-muted")}
                    style={{ height: `${Math.max(4, (r.count / maxRisk) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] uppercase text-muted-foreground">{RISK_LABELS[r.riskLevel] ?? r.riskLevel}</span>
                <span className="font-mono text-xs tabular-nums">{r.count}</span>
              </div>
            ))}
            {riskDist.length === 0 && <p className="text-sm text-muted-foreground">No payments reviewed yet.</p>}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Blocked / flagged table */}
        <div className="rounded-[20px] bg-card ring-1 ring-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="size-4 text-amber-500" />
              <h3 className="text-sm font-medium">Declined & needs review</h3>
            </div>
            <Link href="/dashboard/transactions" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80">
              Review <MoveRightIcon className="size-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Checks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txLoading ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-20 w-full" />
                    </TableCell>
                  </TableRow>
                ) : blocked.concat(flagged.filter((f) => !blocked.includes(f))).slice(0, 6).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                      Nothing needs your attention right now.
                    </TableCell>
                  </TableRow>
                ) : (
                  blocked.concat(flagged.filter((f) => !blocked.includes(f))).slice(0, 6).map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.reference ?? truncateAddress(t.id)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {formatNumber(t.amount)} {t.assetType}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-mono", RISK_STYLES[t.riskLevel] ?? "")}>
                          {RISK_LABELS[t.riskLevel] ?? t.riskLevel.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-mono", STATUS_STYLES[t.status])}>
                          {STATUS_LABELS[t.status] ?? t.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatRelativeTime(t.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Travel-rule data */}
        <div className="rounded-[20px] bg-card ring-1 ring-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 border-b px-5 py-4">
            <Globe2Icon className="size-4 text-primary" />
            <h3 className="text-sm font-medium">Travel-rule data</h3>
          </div>
          <dl className="divide-y">
            <TravelRuleRow label="Jurisdictions monitored" value="12" note="EU, US, UK, SG, JP, UAE…" />
            <TravelRuleRow label="Originator data shared" value="100%" note="All peer-to-peer transfers" />
            <TravelRuleRow label="VASP count" value="248" note="Verified counterparties" />
            <TravelRuleRow label="Required info" value="1,024" note="Beneficiary records attached" />
            <TravelRuleRow label="Threshold alert" value="$3,000" note="Auto-triggered travel-rule share" />
          </dl>
        </div>
      </div>

      {/* Activity history */}
      <div className="rounded-[20px] bg-card ring-1 ring-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 border-b px-5 py-4">
          <ShieldCheckIcon className="size-4 text-primary" />
          <h3 className="text-sm font-medium">Activity history</h3>
          <span className="ml-auto text-xs text-muted-foreground">Most recent first</span>
        </div>
        {auditLoading ? (
          <div className="p-5">
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="max-h-[360px] space-y-1 overflow-y-auto p-3">
            {(auditData?.logs ?? []).slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent/50">
                <div className="w-16 shrink-0 text-right font-mono text-[10px] text-muted-foreground">
                  {new Date(log.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="w-40 shrink-0 truncate font-mono text-xs">{log.action}</div>
                <div className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {log.resourceType} · {log.actorName ?? truncateAddress(log.actorAddress ?? "", 6, 4)}
                </div>
              </div>
            ))}
            {(auditData?.logs ?? []).length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">No activity recorded yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Officers */}
      <div className="rounded-[20px] bg-card p-5 ring-1 ring-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm font-medium">Review team</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {COMPLIANCE_OFFICERS.map((officer) => (
            <div key={officer.name} className="flex items-center gap-3 rounded-lg border bg-background/60 p-3">
              <Avatar>
                <AvatarFallback>{officer.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{officer.name}</p>
                <p className="text-xs text-muted-foreground">{officer.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
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

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Awaiting approval",
  APPROVED: "Approved",
  EXECUTED: "Sent",
  SUSPENDED: "Needs review",
  BLOCKED: "Declined",
  FAILED: "Failed",
};

const RISK_LABELS: Record<string, string> = {
  LOW: "Passed",
  MEDIUM: "Passed",
  HIGH: "Needs review",
  CRITICAL: "Needs review",
};

const RISK_STYLES: Record<string, string> = {
  LOW: "bg-emerald-500/10 text-emerald-500",
  MEDIUM: "bg-amber-500/10 text-amber-500",
  HIGH: "bg-orange-500/10 text-orange-500",
  CRITICAL: "bg-red-500/10 text-red-500",
};

const RISK_COLORS: Record<string, string> = {
  LOW: "bg-emerald-500",
  MEDIUM: "bg-amber-500",
  HIGH: "bg-orange-500",
  CRITICAL: "bg-red-500",
};

function TravelRuleRow({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{note}</p>
      </div>
      <span className="font-mono text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
}