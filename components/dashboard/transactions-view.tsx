"use client";

import * as React from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  PlusIcon,
  ShieldAlertIcon,
  EyeIcon,
  FileCheck2Icon,
  SearchIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useAgents, useTransactions, useTransactionActions } from "@/hooks/use-api";
import { formatNumber, formatDateTime, truncateAddress } from "@/lib/format";
import type { TransactionStatus, TransactionType, Role, TransactionDTO } from "@/lib/types";
import { TransactionTimeline } from "@/components/transaction-timeline";
import { TransactionVerificationStages } from "@/components/dashboard/transaction-stages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<TransactionStatus, string> = {
  PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  EXECUTED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  APPROVED: "bg-sky-500/10 text-sky-500 border-sky-500/30",
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

const TX_TYPES: TransactionType[] = ["PAYMENT", "PAYROLL", "SUPPLIER", "ESCROW", "TREASURY"];
const STATUS_FILTERS = ["ALL", "PENDING", "EXECUTED", "APPROVED", "SUSPENDED", "BLOCKED"] as const;

function StatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <Badge variant="outline" className={cn("font-mono", STATUS_STYLES[status])}>
      {status.toLowerCase()}
    </Badge>
  );
}

function RiskBadge({ riskLevel, score }: { riskLevel: string; score: number }) {
  return (
    <Badge variant="outline" className={cn("font-mono", RISK_STYLES[riskLevel] ?? "")}>
      {riskLevel.toLowerCase()} · {score}
    </Badge>
  );
}

interface CreateForm {
  receiver: string;
  amount: string;
  assetType: string;
  type: TransactionType;
  reference: string;
  agentId: string;
}

export function TransactionsView({ role }: { role: Role }) {
  const queryClient = useQueryClient();
  const isOverseer = role === "COMPLIANCE" || role === "ADMIN";
  const { data, isLoading, error, refetch, isFetching } = useTransactions();
  const { data: agentsData } = useAgents();
  const actions = useTransactionActions();

  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<{ key: "amount" | "createdAt"; dir: "asc" | "desc" }>({
    key: "createdAt",
    dir: "desc",
  });
  const [page, setPage] = React.useState(1);
  const [open, setOpen] = React.useState(false);
  const [detail, setDetail] = React.useState<TransactionDTO | null>(null);
  const [form, setForm] = React.useState<CreateForm>({
    receiver: "",
    amount: "",
    assetType: "USDC",
    type: "PAYMENT",
    reference: "",
    agentId: "",
  });
  const [creating, setCreating] = React.useState(false);
  const [stageRunKey, setStageRunKey] = React.useState(0);
  const [stageBlocked, setStageBlocked] = React.useState(false);
  const [showStages, setShowStages] = React.useState(false);

  const transactions = (data?.transactions ?? [])
    .filter((t) => statusFilter === "ALL" || t.status === statusFilter)
    .filter(
      (t) =>
        search.trim() === "" ||
        (t.reference ?? "").toLowerCase().includes(search.trim().toLowerCase()) ||
        t.sender.toLowerCase().includes(search.trim().toLowerCase()) ||
        t.receiver.toLowerCase().includes(search.trim().toLowerCase())
    )
    .sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "amount") return (a.amount - b.amount) * dir;
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
    });

  const PAGE_SIZE = 8;
  const pageCount = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = transactions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
        <ShieldAlertIcon className="size-8 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Couldn&apos;t load transactions</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {error instanceof Error ? error.message : "Something went wrong."}
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Retrying…" : "Retry"}
        </Button>
      </div>
    );
  }

  function toggleSort(key: "amount" | "createdAt") {
    setSort((s) => {
      if (s.key === key) return { key, dir: s.dir === "asc" ? "desc" : "asc" };
      return { key, dir: key === "createdAt" ? "desc" : "asc" };
    });
  }

  function update<K extends keyof CreateForm>(key: K, value: CreateForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setShowStages(false);
    try {
      const res = await fetch("/api/transaction/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver: form.receiver,
          amount: Number(form.amount),
          assetType: form.assetType,
          type: form.type,
          reference: form.reference || undefined,
          agentId: form.agentId || undefined,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed to create transaction");
      const blocked = data.data.transaction.status === "BLOCKED";
      setStageBlocked(blocked);
      setStageRunKey((k) => k + 1);
      setShowStages(true);
      setCreating(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create transaction");
      setCreating(false);
      setShowStages(false);
    }
  }

  function onStagesComplete() {
    toast.success(stageBlocked ? "Transaction blocked by compliance policy" : "Transaction approved & settled");
    setOpen(false);
    setForm({ receiver: "", amount: "", assetType: "USDC", type: "PAYMENT", reference: "", agentId: "" });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }

  async function runAction(id: string, action: string) {
    const res = await actions.mutateAsync({ id, action });
    if (!res.ok) {
      toast.error(res.error ?? "Action failed");
      return;
    }
    toast.success(`Transaction ${action.toLowerCase()}ed`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search reference or address…"
              className="h-9 w-56 pl-8 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "ALL" ? "All statuses" : s.toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setOpen(true)}>
          <PlusIcon />
          New transaction
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>From → To</TableHead>
              <TableHead className="text-right">
                <button
                  type="button"
                  onClick={() => toggleSort("amount")}
                  className="inline-flex items-center justify-end gap-1 hover:text-foreground"
                >
                  Amount
                  {sort.key === "amount" ? (
                    sort.dir === "asc" ? (
                      <ChevronUpIcon className="size-3" />
                    ) : (
                      <ChevronDownIcon className="size-3" />
                    )
                  ) : (
                    <ChevronUpIcon className="size-3 opacity-40" />
                  )}
                </button>
              </TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("createdAt")}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  Created
                  {sort.key === "createdAt" ? (
                    sort.dir === "asc" ? (
                      <ChevronUpIcon className="size-3" />
                    ) : (
                      <ChevronDownIcon className="size-3" />
                    )
                  ) : (
                    <ChevronUpIcon className="size-3 opacity-40" />
                  )}
                </button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Skeleton className="h-20 w-full" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                  No transactions match this filter.
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              paged.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <StatusBadge status={t.status} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.type.toLowerCase()}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {truncateAddress(t.sender)} → {truncateAddress(t.receiver)}
                    {t.agentName && <span className="text-muted-foreground"> · {t.agentName}</span>}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatNumber(t.amount)} {t.assetType}
                  </TableCell>
                  <TableCell>
                    <RiskBadge riskLevel={t.riskLevel} score={t.riskScore} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDateTime(t.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button size="sm" variant="ghost" onClick={() => setDetail(t)} aria-label="View details">
                        <EyeIcon />
                      </Button>
                      {isOverseer && t.status !== "BLOCKED" && t.status !== "FAILED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actions.isPending}
                          onClick={() => runAction(t.id, "SUSPEND")}
                        >
                          Suspend
                        </Button>
                      )}
                      {isOverseer && (t.status === "SUSPENDED" || t.status === "PENDING") && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actions.isPending}
                          onClick={() => runAction(t.id, "RELEASE")}
                        >
                          Release
                        </Button>
                      )}
                      {isOverseer && t.status !== "BLOCKED" && t.status !== "FAILED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actions.isPending}
                          onClick={() => runAction(t.id, "BLOCK")}
                        >
                          Block
                        </Button>
                      )}
                      {t.status === "SUSPENDED" && (
                        <Button size="sm" disabled={actions.isPending} onClick={() => runAction(t.id, "APPROVE")}>
                          Approve
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {!isLoading && transactions.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {transactions.length} transactions · page {safePage} of {pageCount}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeftIcon className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={safePage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                <ChevronRightIcon className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New transaction</DialogTitle>
            <DialogDescription>
              Evaluated against CCP rules, agent limits, and Cleanverse risk scoring.
            </DialogDescription>
          </DialogHeader>
          {showStages ? (
            <div className="rounded-lg border bg-muted/30 p-4">
              <TransactionVerificationStages
                key={`${stageRunKey}-${stageBlocked}`}
                run={showStages}
                failedAtKey={stageBlocked ? "approval" : null}
                onComplete={() => onStagesComplete()}
              />
            </div>
          ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tx-receiver">Receiver</Label>
              <Input
                id="tx-receiver"
                placeholder="0x…"
                className="font-mono"
                value={form.receiver}
                onChange={(e) => update("receiver", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="tx-amount">Amount</Label>
                <Input
                  id="tx-amount"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="100.00"
                  value={form.amount}
                  onChange={(e) => update("amount", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tx-asset">Asset</Label>
                <Select value={form.assetType} onValueChange={(v) => update("assetType", v ?? "USDC")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["USDC", "USDT", "MON", "DAI"].map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="tx-type">Type</Label>
                <Select value={form.type} onValueChange={(v) => update("type", (v ?? "PAYMENT") as TransactionType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TX_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tx-agent">Agent</Label>
                <Select value={form.agentId} onValueChange={(v) => update("agentId", v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">—</SelectItem>
                    {(agentsData?.agents ?? []).map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-ref">Reference (optional)</Label>
              <Input
                id="tx-ref"
                placeholder="INV-0001"
                value={form.reference}
                onChange={(e) => update("reference", e.target.value)}
              />
            </div>
            <div className="flex items-start gap-2 rounded-lg border bg-amber-500/5 p-3 text-xs text-muted-foreground">
              <ShieldAlertIcon className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <span>
                High-risk or policy-violating transactions are blocked automatically. Transactions sent to unknown
                receivers are denied by default.
              </span>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={creating || !form.receiver || !form.amount}>
                {creating ? "Evaluating…" : "Create & evaluate"}
              </Button>
            </DialogFooter>
          </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck2Icon className="size-4 text-primary" />
              Transaction audit trail
            </DialogTitle>
            <DialogDescription>
              {detail && (
                <span className="font-mono">
                  {detail.reference ?? truncateAddress(detail.id)} · {formatDateTime(detail.createdAt)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">From → To</div>
                  <div className="mt-0.5 font-mono text-xs">
                    {truncateAddress(detail.sender)} → {truncateAddress(detail.receiver)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Amount</div>
                  <div className="mt-0.5 font-mono">
                    {formatNumber(detail.amount)} {detail.assetType}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="mt-1">
                    <StatusBadge status={detail.status} />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Risk score</div>
                  <div className="mt-1">
                    <RiskBadge riskLevel={detail.riskLevel} score={detail.riskScore} />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium">Lifecycle</h4>
                <TransactionTimeline
                  status={detail.status}
                  verified={detail.riskScore < 70}
                  decisionsCount={detail.decisions.length}
                  auditHash={detail.auditHash}
                />
              </div>

              {detail.decisions.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium">Policy decisions</h4>
                  <div className="space-y-1.5">
                    {detail.decisions.map((d, i) => (
                      <div key={i} className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-1.5 text-xs">
                        <span className="font-mono">{d.rule}</span>
                        <span
                          className={cn(
                            "font-mono font-medium",
                            d.result === "ALLOW" || d.result === "PASS" ? "text-emerald-500" : "text-red-500"
                          )}
                        >
                          {d.result}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detail.auditHash && (
                <div className="rounded-lg border bg-emerald-500/5 p-3">
                  <div className="text-xs text-muted-foreground">Audit hash</div>
                  <div className="mt-1 break-all font-mono text-xs text-emerald-500">{detail.auditHash}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
