"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ShieldCheckIcon, FileCheck2Icon, ScaleIcon, BadgeCheckIcon } from "lucide-react";
import { formatCompactCurrency, formatDateTime, formatNumber, truncateAddress } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { PublicReport } from "@/lib/database/reports";

const VALIDATION_STYLES: Record<string, string> = {
  PASS: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  FLAGGED: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  REJECTED: "bg-red-500/10 text-red-500 border-red-500/30",
  PENDING: "bg-sky-500/10 text-sky-500 border-sky-500/30",
};

const RISK_STYLES: Record<string, string> = {
  LOW: "bg-emerald-500/10 text-emerald-500",
  MEDIUM: "bg-amber-500/10 text-amber-500",
  HIGH: "bg-orange-500/10 text-orange-500",
  CRITICAL: "bg-red-500/10 text-red-500",
};

const FILTERS = ["ALL", "PASS", "FLAGGED", "REJECTED", "PENDING"] as const;

export function ReportViewer({ report, history }: { report: PublicReport; history: Array<{ id: string; reportHash: string; createdAt: string }> }) {
  const [filter, setFilter] = React.useState<string>("ALL");

  const entries = report.entries.filter((e) => filter === "ALL" || e.validation === filter);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border bg-card"
      >
        <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileCheck2Icon className="size-5" />
            </div>
            <div>
              <p className="font-mono text-xs text-muted-foreground">Report identifier</p>
              <p className="break-all font-mono text-sm">{report.reportHash}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-mono">
              {report.type.toLowerCase()}
            </Badge>
            <span>
              {formatDateTime(report.periodStart)} → {formatDateTime(report.periodEnd)}
            </span>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border bg-background/60 p-4">
            <dt className="text-xs text-muted-foreground">Settled volume</dt>
            <dd className="mt-1 font-mono text-lg font-semibold">{formatCompactCurrency(report.totalVolume)}</dd>
          </div>
          <div className="rounded-lg border bg-background/60 p-4">
            <dt className="text-xs text-muted-foreground">Transactions</dt>
            <dd className="mt-1 font-mono text-lg font-semibold">{formatNumber(report.transactions, 0)}</dd>
          </div>
          <div className="rounded-lg border bg-background/60 p-4">
            <dt className="text-xs text-muted-foreground">Flags</dt>
            <dd className="mt-1 font-mono text-lg font-semibold text-amber-500">{formatNumber(report.flags, 0)}</dd>
          </div>
          <div className="rounded-lg border bg-background/60 p-4">
            <dt className="text-xs text-muted-foreground">Suspended / blocked</dt>
            <dd className="mt-1 font-mono text-lg font-semibold">
              {formatNumber(report.suspensions, 0)} <span className="text-muted-foreground">/</span>{" "}
              <span className="text-red-500">{formatNumber(report.blocked, 0)}</span>
            </dd>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-xl border bg-card"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <div className="flex items-center gap-2">
            <ScaleIcon className="size-4 text-primary" />
            <h2 className="text-sm font-medium">Transaction validation ledger</h2>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  filter === f
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                )}
              >
                {f === "ALL" ? "All" : f.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>From → To</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Validation</TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.transactionId}>
                  <TableCell>
                    <div className="font-mono text-xs">{e.reference ?? truncateAddress(e.transactionId)}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">{e.type.toLowerCase()}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {truncateAddress(e.sender)} → {truncateAddress(e.receiver)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatNumber(e.amount)} {e.assetType}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDateTime(e.timestamp)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("font-mono", VALIDATION_STYLES[e.validation] ?? "")}>
                      {e.validation.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("font-mono", RISK_STYLES[e.riskLevel] ?? "")}>
                      {e.riskLevel.toLowerCase()} · {e.riskScore}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {entries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-20 text-center text-sm text-muted-foreground">
                    No entries match this filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {history.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl border bg-card p-5"
        >
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="size-4 text-primary" />
            <h2 className="text-sm font-medium">Previous signed reports</h2>
          </div>
          <ul className="mt-3 space-y-2">
            {history.slice(1).map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-mono text-muted-foreground">{h.reportHash}</span>
                <span className="shrink-0 flex items-center gap-1.5 text-muted-foreground">
                  <BadgeCheckIcon className="size-3.5 text-emerald-500" />
                  {formatDateTime(h.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
