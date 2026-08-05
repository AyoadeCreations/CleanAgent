"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FileBarChart2Icon,
  RefreshCwIcon,
  FileCheck2Icon,
  CopyIcon,
  BadgeCheckIcon,
} from "lucide-react";
import { useReports } from "@/hooks/use-api";
import { formatCompactCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ReportsView() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch, isFetching } = useReports();
  const [generating, setGenerating] = React.useState(false);

  async function generate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/report", { method: "POST" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Failed to generate report");
      toast.success("Activity record generated");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate activity record");
    } finally {
      setGenerating(false);
    }
  }

  const latest = data?.reports?.[0];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-12 text-center">
        <FileBarChart2Icon className="size-8 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Couldn&apos;t load activity records</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {error instanceof Error ? error.message : "Something went wrong."}
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCwIcon />
          {isFetching ? "Retrying…" : "Retry"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={generate} disabled={generating || isLoading}>
          <FileBarChart2Icon />
          {generating ? "Creating activity record…" : "Create activity record"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Latest record</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !latest ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center">
              <FileCheck2Icon className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">No activity recorded yet</p>
              <p className="text-xs text-muted-foreground">
                Create an activity record to keep a secure history of your payments.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border bg-background/60 p-4">
                <dt className="text-xs text-muted-foreground">Volume (30d)</dt>
                <dd className="mt-1 font-mono text-lg font-semibold">{formatCompactCurrency(latest.data.totalVolume)}</dd>
              </div>
              <div className="rounded-lg border bg-background/60 p-4">
                <dt className="text-xs text-muted-foreground">Payments</dt>
                <dd className="mt-1 font-mono text-lg font-semibold">{formatNumber(latest.data.transactions, 0)}</dd>
              </div>
              <div className="rounded-lg border bg-background/60 p-4">
                <dt className="text-xs text-muted-foreground">Needs review</dt>
                <dd className="mt-1 font-mono text-lg font-semibold">{formatNumber(latest.data.flags, 0)}</dd>
              </div>
              <div className="rounded-lg border bg-background/60 p-4">
                <dt className="text-xs text-muted-foreground">Needs review / declined</dt>
                <dd className="mt-1 font-mono text-lg font-semibold">
                  {formatNumber(latest.data.suspensions, 0)} / {formatNumber(latest.data.blocked, 0)}
                </dd>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Activity history</CardTitle>
          <RefreshCwIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Created</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="max-w-[260px]">Record hash</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead className="text-right">Payments</TableHead>
                    <TableHead className="text-right">Needs review</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {(data?.reports ?? []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(r.createdAt)}</TableCell>
                    <TableCell className="font-mono text-xs">{r.type.toLowerCase()}</TableCell>
                    <TableCell>
                      <div className="flex max-w-[260px] items-center gap-1.5">
                        <span className="truncate font-mono text-[10px] text-muted-foreground">{r.reportHash}</span>
                        <button
                          type="button"
                          aria-label="Copy record hash"
                          onClick={() => {
                            navigator.clipboard?.writeText(r.reportHash);
                            toast.success("Record hash copied");
                          }}
                          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <CopyIcon className="size-3.5" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {formatCompactCurrency(r.data.totalVolume)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {formatNumber(r.data.transactions, 0)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-amber-500">
                      {formatNumber(r.data.flags, 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1 border-emerald-500/30 bg-emerald-500/10 font-mono text-[10px] text-emerald-500"
                        )}
                      >
                        <BadgeCheckIcon className="size-3" />
                        recorded
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(data?.reports ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-20 text-center text-sm text-muted-foreground">
                      No activity records yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
