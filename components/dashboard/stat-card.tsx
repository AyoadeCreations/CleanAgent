"use client";

import * as React from "react";
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedNumber } from "@/components/animated-counter";
import { cn } from "@/lib/utils";

function TrendBadge({ value }: { value?: number }) {
  const delta = value ?? 0;
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
        <MinusIcon className="size-3" />
        {delta}%
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-xs font-medium ring-1",
        up
          ? "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20"
          : "bg-red-500/10 text-red-500 ring-red-500/20"
      )}
    >
      {up ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
      {up ? "+" : ""}
      {delta}%
    </span>
  );
}

export function StatCard({
  label,
  value,
  sub,
  trend,
  loading,
  icon,
  spark,
  sparkColor = "#2563eb",
  delay = 0,
}: {
  label: string;
  value: number;
  sub?: string;
  trend?: number;
  loading?: boolean;
  icon?: React.ReactNode;
  spark?: Array<{ v: number }>;
  sparkColor?: string;
  delay?: number;
}) {
  const gradientId = React.useId().replace(/:/g, "");
  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          {icon ? (
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary/8 text-primary">
              {icon}
            </span>
          ) : (
            <span />
          )}
          {!loading && trend !== undefined && <TrendBadge value={trend} />}
        </div>

        {loading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <>
            <div className="flex items-baseline gap-1.5">
              <AnimatedNumber value={value} className="text-3xl font-semibold tracking-tight tabular-nums" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
            </div>
          </>
        )}

        {!loading && spark && spark.length > 1 && (
          <div className="-mx-6 -mb-4 h-10 w-[calc(100%+3rem)]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spark} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={sparkColor} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={sparkColor}
                  strokeWidth={1.5}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}