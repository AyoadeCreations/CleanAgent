"use client";

import { useRules, useAuditLogs, useTransactions } from "@/hooks/use-api";
import { truncateAddress } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ComplianceBadge } from "@/components/compliance-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ComplianceView() {
  const { data: rulesData, isLoading: rulesLoading, error: rulesError, refetch: refetchRules, isFetching: rulesFetching } = useRules();
  const { data: auditData, isLoading: auditLoading, error: auditError, refetch: refetchAudit, isFetching: auditFetching } = useAuditLogs();
  const { data: txData, isLoading: txLoading, error: txError, refetch: refetchTx, isFetching: txFetching } = useTransactions();

  const pendingReviews = (txData?.transactions ?? []).filter((t) => t.status === "SUSPENDED").length;
  const highRisk = (txData?.transactions ?? []).filter((t) => t.riskLevel === "CRITICAL" || t.riskLevel === "HIGH").length;

  return (
    <div className="space-y-6">
      {txError && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed p-4">
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load transaction summaries — {txError instanceof Error ? txError.message : "try again"}.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetchTx()} disabled={txFetching}>
            {txFetching ? "Retrying…" : "Retry"}
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {txLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-semibold tracking-tight">{pendingReviews}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">High-risk transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {txLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-semibold tracking-tight">{highRisk}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Compliance policy rules</CardTitle>
        </CardHeader>
        <CardContent>
          {rulesLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : rulesError ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-10 text-center">
              <p className="text-sm text-muted-foreground">Couldn&apos;t load compliance rules.</p>
              <Button variant="outline" size="sm" onClick={() => refetchRules()} disabled={rulesFetching}>
                {rulesFetching ? "Retrying…" : "Retry"}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Conditions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(rulesData?.rules ?? []).map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div className="text-sm font-medium">{rule.name}</div>
                      {rule.description && (
                        <div className="text-xs text-muted-foreground">{rule.description}</div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{rule.type}</TableCell>
                    <TableCell>
                      <ComplianceBadge status={rule.action} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{rule.priority}</TableCell>
                    <TableCell>
                      <ComplianceBadge status={rule.enabled ? "VERIFIED" : "PAUSED"} label={rule.enabled ? "enabled" : "disabled"} />
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate font-mono text-[10px] text-muted-foreground">
                      {JSON.stringify(rule.conditions)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Audit trail</CardTitle>
        </CardHeader>
        <CardContent>
          {auditLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : auditError ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-10 text-center">
              <p className="text-sm text-muted-foreground">
                {auditError instanceof Error && auditError.message === "Request failed"
                  ? "Audit logs are restricted to compliance officers."
                  : "Couldn&apos;t load the audit trail."}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetchAudit()} disabled={auditFetching}>
                {auditFetching ? "Retrying…" : "Retry"}
              </Button>
            </div>
          ) : (
            <div className="max-h-[480px] space-y-1 overflow-y-auto">
              {(auditData?.logs ?? []).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent/50"
                >
                  <div className="w-8 shrink-0 text-right font-mono text-[10px] text-muted-foreground">
                    {new Date(log.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="w-44 shrink-0">
                    <span className="font-mono text-xs text-foreground">{log.action}</span>
                  </div>
                  <div className="w-40 shrink-0 truncate text-xs text-muted-foreground">
                    {log.resourceType} · {truncateAddress(log.resourceId, 6, 4)}
                  </div>
                  <div className="flex-1 truncate text-xs text-muted-foreground">
                    {log.actorName ?? truncateAddress(log.actorAddress ?? "", 6, 4)}
                    <span className="ml-1 uppercase">{log.actorRole}</span>
                  </div>
                  <div className="shrink-0 font-mono text-[10px] text-muted-foreground">{log.ipAddress}</div>
                </div>
              ))}
              {(auditData?.logs ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No audit events yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
