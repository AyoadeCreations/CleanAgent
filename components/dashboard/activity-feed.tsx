"use client";

import {
  ShieldCheckIcon,
  ScaleIcon,
  ArrowRightLeftIcon,
  LandmarkIcon,
  FileCheck2Icon,
  CheckCircle2Icon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const events = [
  { icon: ShieldCheckIcon, title: "Identity verified", detail: "Helios Logistics · CVI attestation", tone: "text-emerald-600" },
  { icon: ShieldCheckIcon, title: "Asset verified", detail: "USDC collateral · CVA screening", tone: "text-emerald-600" },
  { icon: ScaleIcon, title: "Rules executed", detail: "CCP policy evaluated · 3/3 passed", tone: "text-amber-600" },
  { icon: ArrowRightLeftIcon, title: "Transaction approved", detail: "PAY-2026-001 · $4,200 USDC", tone: "text-blue-600" },
  { icon: LandmarkIcon, title: "Settlement completed", detail: "Funds released on-chain", tone: "text-violet-600" },
  { icon: FileCheck2Icon, title: "Audit report generated", detail: "Signed hash recorded", tone: "text-rose-600" },
];

export function ActivityFeed() {
  return (
    <div className="rounded-[24px] bg-card p-8 ring-1 ring-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Activity feed</h3>
          <p className="mt-1 text-sm text-muted-foreground">Latest lifecycle across your workspace</p>
        </div>
        <Badge variant="outline" className="gap-1.5 text-emerald-600">
          <CheckCircle2Icon className="size-3.5" />
          Live
        </Badge>
      </div>
      <ol className="relative">
        {events.map((event, i) => (
          <li key={event.title} className="relative flex gap-4 pb-6 last:pb-0">
            {i < events.length - 1 && (
              <span className="absolute top-7 left-[15px] h-[calc(100%-20px)] w-px bg-border" aria-hidden="true" />
            )}
            <span className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted ${event.tone}`}>
              <event.icon className="size-4" />
            </span>
            <div className="min-w-0 pt-1">
              <p className="text-sm font-medium">{event.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{event.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}