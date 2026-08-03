"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  FingerprintIcon,
  CoinsIcon,
  ScaleIcon,
  BadgeCheckIcon,
  LandmarkIcon,
  FileCheck2Icon,
  XCircleIcon,
} from "lucide-react";
import type { TransactionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export type TimelineState = "done" | "pending" | "active" | "failed" | "skipped";

export interface TransactionTimelineProps {
  status: TransactionStatus;
  verified?: boolean;
  decisionsCount?: number;
  auditHash?: string | null;
  compact?: boolean;
}

interface StepDef {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  state: TimelineState;
}

const STEP_DEFS: Array<Omit<StepDef, "state">> = [
  { key: "identity", label: "Identity verification", description: "CVI check on the sender", icon: FingerprintIcon },
  { key: "asset", label: "Asset verification", description: "CVA check on the asset", icon: CoinsIcon },
  { key: "rules", label: "Rule validation", description: "CCP policy evaluation", icon: ScaleIcon },
  { key: "approval", label: "Transaction approval", description: "Risk threshold review", icon: BadgeCheckIcon },
  { key: "settlement", label: "Settlement", description: "Funds released to receiver", icon: LandmarkIcon },
  { key: "audit", label: "Audit generation", description: "Signed audit hash recorded", icon: FileCheck2Icon },
];

const STATE_META: Record<TimelineState, { icon: React.ComponentType<{ className?: string }> | null; dot: string; text: string }> = {
  done: { icon: BadgeCheckIcon, dot: "bg-emerald-500", text: "text-emerald-500" },
  active: { icon: null, dot: "bg-primary animate-pulse", text: "text-primary" },
  pending: { icon: null, dot: "bg-border", text: "text-muted-foreground" },
  failed: { icon: XCircleIcon, dot: "bg-red-500", text: "text-red-500" },
  skipped: { icon: null, dot: "bg-muted", text: "text-muted-foreground opacity-60" },
};

export function buildTimelineSteps(props: TransactionTimelineProps): StepDef[] {
  const { status, verified = true, decisionsCount = 1, auditHash = "" } = props;
  const isBlocked = status === "BLOCKED";
  const isFailed = status === "FAILED";
  const settled = status === "EXECUTED";
  const approved = status === "APPROVED" || settled;
  const suspended = status === "SUSPENDED" || status === "PENDING";

  return STEP_DEFS.map((step) => {
    let state: TimelineState = "pending";
    switch (step.key) {
      case "identity":
        state = verified ? "done" : isBlocked ? "failed" : "active";
        break;
      case "asset":
        state = verified ? "done" : "pending";
        break;
      case "rules":
        state = decisionsCount > 0 ? "done" : isBlocked ? "done" : "pending";
        break;
      case "approval":
        state = isBlocked ? "failed" : isFailed ? "failed" : approved ? "done" : suspended ? "active" : "pending";
        break;
      case "settlement":
        state = isBlocked ? "skipped" : isFailed ? "skipped" : settled ? "done" : approved ? "pending" : "pending";
        break;
      case "audit":
        state = auditHash ? "done" : settled ? "active" : isBlocked ? "skipped" : "pending";
        break;
    }
    return { ...step, state };
  });
}

export function TransactionTimeline({
  status,
  verified,
  decisionsCount,
  auditHash,
  compact,
}: TransactionTimelineProps) {
  const steps = buildTimelineSteps({ status, verified, decisionsCount, auditHash });

  return (
    <ol className={cn("relative space-y-0", compact ? "gap-1" : "gap-2")}>
      {steps.map((step, i) => {
        const meta = STATE_META[step.state];
        const Icon = step.icon;
        return (
          <motion.li
            key={step.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3, ease: "easeOut" }}
            className="relative flex gap-3 pb-5 last:pb-0"
          >
            {i < steps.length - 1 && (
              <span className="absolute top-6 left-[11px] h-[calc(100%-16px)] w-px bg-border" aria-hidden="true" />
            )}
            <span
              className={cn(
                "relative z-10 mt-0.5 flex size-[23px] shrink-0 items-center justify-center rounded-full ring-4 ring-background",
                meta.dot
              )}
            >
              {meta.icon && <meta.icon className={cn("size-3.5 text-background", meta.text)} />}
            </span>
            <div className={cn("min-w-0 flex-1 pt-0.5", step.state === "pending" && "opacity-60")}>
              <div className="flex items-center gap-2">
                <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                <span className={cn("text-sm font-medium", meta.text)}>{step.label}</span>
              </div>
              {!compact && <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
