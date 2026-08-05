"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BotIcon,
  ListChecksIcon,
  HistoryIcon,
  WalletIcon,
  ScaleIcon,
  ArrowLeftRightIcon,
  MoveRightIcon,
  CheckCircle2Icon,
  GaugeIcon,
  ActivityIcon,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { useDashboard, useTransactions, useAgents, useRules } from "@/hooks/use-api";
import { formatNumber, formatRelativeTime, truncateAddress } from "@/lib/format";
import { WORLD_AGENTS, greeting } from "@/lib/world";
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
import { cn } from "@/lib/utils";

export function AgentDashboard({ userName, verified }: { userName?: string; verified?: boolean }) {
  const { data, isLoading } = useDashboard();
  const { data: txData, isLoading: txLoading } = useTransactions();
  const { data: agentsData, isLoading: agentsLoading } = useAgents();
  const { data: rulesData, isLoading: rulesLoading } = useRules();

  const o = data?.overview;
  const t = data?.trends;
  const volumeSpark = (data?.volumeByDay ?? []).map((d) => ({ v: d.volume }));
  const execSpark = (data?.activityByDay ?? []).map((d) => ({ v: d.settlementCount }));
  const scoreSpark = (data?.activityByDay ?? []).map((d) => {
    const total = d.settlementCount + d.blockedCount;
    return { v: total === 0 ? 100 : Math.max(0, Math.round(100 - (d.blockedCount / total) * 60 - d.avgRisk / 2)) };
  });

  const agents = agentsData?.agents ?? [];
  const activeAgents = agents.filter((a) => a.status === "ACTIVE");
  const recentAgentTxs = (txData?.transactions ?? [])
    .filter((tx) => tx.agentId)
    .slice(0, 6);
  const totalAgentVolume = (txData?.transactions ?? [])
    .filter((tx) => tx.agentId)
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 to-purple-700 px-6 py-8 text-white shadow-[0_20px_50px_-20px_rgba(139,92,246,0.5)] sm:px-10 sm:py-10"
      >
        <div className="absolute -right-10 -top-12 size-48 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <p className="text-xs font-medium uppercase tracking-widest text-violet-100 sm:text-sm">
          {greeting()}, {userName ?? "Agent"}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">Automation workspace</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-violet-50 sm:text-base">
          Payment automations that work within the limits you set.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
            <BotIcon className="size-3" />
            {activeAgents.length} active automations
          </Badge>
          <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
            <ActivityIcon className="size-3" />
            monitoring live
          </Badge>
          {verified !== undefined && (
            <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
              <CheckCircle2Icon className="size-3" />
              {verified ? "Verified business" : "Verification pending"}
            </Badge>
          )}
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active automations"
          value={activeAgents.length}
          sub="Automations running on schedule"
          icon={<ListChecksIcon className="size-4.5" />}
          spark={execSpark}
          trend={t?.agentsPercent}
          loading={agentsLoading}
        />
        <StatCard
          label="Automation history"
          value={(txData?.transactions ?? []).filter((tx) => tx.agentId).length}
          sub="Payments run by automations"
          icon={<HistoryIcon className="size-4.5" />}
          spark={execSpark}
          trend={t?.transactionsPercent}
          loading={txLoading}
          sparkColor="#8b5cf6"
        />
        <StatCard
          label="Automation volume"
          value={totalAgentVolume}
          sub="Total volume via automations"
          icon={<WalletIcon className="size-4.5" />}
          spark={volumeSpark}
          trend={t?.volumePercent}
          loading={isLoading}
          sparkColor="#10b981"
        />
        <StatCard
          label="Account health"
          value={o?.complianceScore ?? 0}
          sub="Business health score · /100"
          icon={<GaugeIcon className="size-4.5" />}
          spark={scoreSpark}
          trend={t?.complianceDelta}
          loading={isLoading}
          sparkColor="#f59e0b"
        />
      </div>

      {/* Agents with limits */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {agentsLoading ? (
          <Skeleton className="h-40 w-full md:col-span-2 xl:col-span-4" />
        ) : agents.length === 0 ? (
          <p className="md:col-span-2 xl:col-span-4 py-8 text-center text-sm text-muted-foreground">
            No automations yet. Create one to get started.
          </p>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.id}
              className="group rounded-[20px] bg-card p-5 ring-1 ring-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BotIcon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.description ?? "Payment agent"}</p>
                  </div>
                </div>
                <Badge variant="outline" className={cn("font-mono", AGENT_STYLES[agent.status])}>
                  {agent.status.toLowerCase()}
                </Badge>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border bg-background/60 p-2">
                  <dt className="text-muted-foreground">Daily limit</dt>
                  <dd className="mt-0.5 font-mono font-medium">{formatNumber(agent.dailyLimit, 0)}</dd>
                </div>
                <div className="rounded-md border bg-background/60 p-2">
                  <dt className="text-muted-foreground">Monthly limit</dt>
                  <dd className="mt-0.5 font-mono font-medium">{formatNumber(agent.monthlyLimit, 0)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">
                {formatNumber(agent.transactionCount, 0)} payments run
                {agent.lastUsedAt ? ` · ${formatRelativeTime(agent.lastUsedAt)}` : ""}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Policy rules */}
        <div className="rounded-[20px] bg-card ring-1 ring-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div className="flex items-center gap-2">
              <ScaleIcon className="size-4 text-primary" />
              <h3 className="text-sm font-medium">Account rules</h3>
            </div>
            <Link href="/dashboard/compliance" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80">
              Manage <MoveRightIcon className="size-3.5" />
            </Link>
          </div>
          <div className="divide-y">
            {rulesLoading ? (
              <div className="p-5">
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (rulesData?.rules ?? []).length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No account rules configured.</p>
            ) : (
              (rulesData?.rules ?? []).slice(0, 5).map((rule) => (
                <div key={rule.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{rule.name}</p>
                    <p className="text-xs text-muted-foreground">{rule.type} · priority {rule.priority}</p>
                  </div>
                  <Badge variant="outline" className={cn("font-mono", rule.action === "BLOCK" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500")}>
                    {rule.action.toLowerCase()}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Execution history */}
        <div className="rounded-[20px] bg-card ring-1 ring-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 border-b px-5 py-4">
            <ArrowLeftRightIcon className="size-4 text-primary" />
            <h3 className="text-sm font-medium">Payment summaries</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Automation</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txLoading ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-20 w-full" />
                    </TableCell>
                  </TableRow>
                ) : recentAgentTxs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                      No payments run by automations yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentAgentTxs.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs">{tx.agentName ?? "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{truncateAddress(tx.receiver)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {formatNumber(tx.amount)} {tx.assetType}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-mono", TX_STYLES[tx.status])}>
                          {TX_LABELS[tx.status] ?? tx.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatRelativeTime(tx.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Automation ideas */}
      <div className="rounded-[20px] bg-card p-5 ring-1 ring-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm font-medium">Ways to automate</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {WORLD_AGENTS.map((agent) => (
            <div key={agent.name} className="flex items-start gap-3 rounded-lg border bg-background/60 p-3">
              <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              <div>
                <p className="text-sm font-medium">{agent.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{agent.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const AGENT_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  PAUSED: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  SUSPENDED: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  DEACTIVATED: "bg-muted text-muted-foreground border-border",
};

const TX_LABELS: Record<string, string> = {
  PENDING: "Awaiting approval",
  APPROVED: "Approved",
  EXECUTED: "Sent",
  SUSPENDED: "Needs review",
  BLOCKED: "Declined",
  FAILED: "Failed",
};

const TX_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  APPROVED: "bg-sky-500/10 text-sky-500 border-sky-500/30",
  EXECUTED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  SUSPENDED: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  BLOCKED: "bg-red-500/10 text-red-500 border-red-500/30",
  FAILED: "bg-rose-500/10 text-rose-500 border-rose-500/30",
};