"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  WalletIcon,
  ArrowLeftRightIcon,
  BotIcon,
  ShieldCheckIcon,
  FileBarChart2Icon,
  FingerprintIcon,
} from "lucide-react";
import { useDashboard, useTransactions } from "@/hooks/use-api";
import { formatCompactCurrency, formatDateTime, truncateAddress } from "@/lib/format";
import type { Role } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { VerifiedEntityBadge, ComplianceBadge } from "@/components/compliance-badge";

const ROLE_META: Record<
  Role,
  {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    links: Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
  }
> = {
  MERCHANT: {
    title: "Merchant workspace",
    description: "Receive verified payments, issue invoices, and track settlements.",
    icon: WalletIcon,
    links: [
      { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRightIcon },
      { href: "/dashboard/reports", label: "Reports", icon: FileBarChart2Icon },
    ],
  },
  BUSINESS: {
    title: "Business workspace",
    description: "Operate agents, enforce payment policy, and manage payroll and suppliers.",
    icon: BotIcon,
    links: [
      { href: "/dashboard/agents", label: "Agents", icon: BotIcon },
      { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRightIcon },
      { href: "/dashboard/compliance", label: "Compliance", icon: ShieldCheckIcon },
    ],
  },
  COMPLIANCE: {
    title: "Compliance workspace",
    description: "Monitor policy, review flags, and keep the audit trail honest.",
    icon: ShieldCheckIcon,
    links: [
      { href: "/dashboard/compliance", label: "Compliance", icon: ShieldCheckIcon },
      { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRightIcon },
      { href: "/dashboard/reports", label: "Reports", icon: FileBarChart2Icon },
    ],
  },
  ADMIN: {
    title: "Admin workspace",
    description: "Platform-wide visibility across identities, transactions, and policy.",
    icon: FingerprintIcon,
    links: [
      { href: "/dashboard", label: "Overview", icon: ArrowLeftRightIcon },
      { href: "/dashboard/compliance", label: "Compliance", icon: ShieldCheckIcon },
      { href: "/dashboard/reports", label: "Reports", icon: FileBarChart2Icon },
    ],
  },
};

export function RoleHome({ role, verified }: { role: Role; verified: boolean }) {
  const meta = ROLE_META[role];
  const { data, isLoading } = useDashboard();
  const { data: txData } = useTransactions();

  const o = data?.overview;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <meta.icon className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{meta.title}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">{meta.description}</p>
            </div>
          </div>
          <VerifiedEntityBadge verified={verified} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {meta.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-accent"
            >
              <link.icon className="size-4" />
              {link.label}
              <ArrowRightIcon className="size-3.5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total volume</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-semibold tracking-tight">{formatCompactCurrency(o?.totalVolume ?? 0)}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-semibold tracking-tight">{o?.transactionCount ?? 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Active agents</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-semibold tracking-tight">{o?.activeAgents ?? 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance score</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-semibold tracking-tight">{o?.complianceScore ?? 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (txData?.transactions ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="space-y-1">
              {(txData?.transactions ?? []).slice(0, 6).map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent/50">
                  <div className="w-24 shrink-0">
                    <ComplianceBadge status={t.status} />
                  </div>
                  <div className="min-w-0 flex-1 font-mono text-xs">
                    {truncateAddress(t.sender)} → {truncateAddress(t.receiver)}
                  </div>
                  <div className="font-mono text-xs">{t.amount} {t.assetType}</div>
                  <div className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                    {formatDateTime(t.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
