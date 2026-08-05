"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2Icon,
  FingerprintIcon,
  CoinsIcon,
  ScaleIcon,
  BadgeCheckIcon,
  FileCheck2Icon,
  CheckIcon,
  XCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StageDef {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STAGES: StageDef[] = [
  { key: "analyze", label: "Preparing your payment", icon: Loader2Icon },
  { key: "identity", label: "Confirming your business", icon: FingerprintIcon },
  { key: "assets", label: "Checking available funds", icon: CoinsIcon },
  { key: "rules", label: "Running safety checks", icon: ScaleIcon },
  { key: "approval", label: "Payment approved", icon: BadgeCheckIcon },
  { key: "audit", label: "Activity recorded", icon: FileCheck2Icon },
];

const ACTIVE_DWELL = 700;
const PASS_DWELL = 160;

/**
 * A timed stage runner for a transaction submission. `run` starts the run;
 * `failedAtKey` short-circuits the approval step into a blocked outcome. When
 * every stage resolves, `onComplete` fires. Stages advance automatically on a
 * fixed timeline so the UI reads like a real multi-pass check.
 */
export function TransactionVerificationStages({
  run,
  failedAtKey,
  onComplete,
}: {
  run: boolean;
  failedAtKey?: string | null;
  onComplete?: () => void;
}) {
  const [completed, setCompleted] = React.useState<string[]>([]);
  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  const [blocked, setBlocked] = React.useState(false);
  const [finished, setFinished] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    // For a transaction that gets blocked, we stop before the approval line.
    const failIdx = failedAtKey ? STAGES.findIndex((s) => s.key === "approval") : -1;
    const stopIdx = failIdx >= 0 ? failIdx : STAGES.length;

    let cursor = 0;
    const advance = () => {
      if (cancelled) return;
      if (cursor >= stopIdx) {
        setFinished(true);
        onComplete?.();
        return;
      }
      const def = STAGES[cursor];
      setCompleted((prev) => (def.key === "analyze" ? prev : prev.filter((k) => k !== def.key)));
      setActiveKey(def.key);
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setCompleted((prev) => [...prev, def.key]);
          setActiveKey(null);
          cursor += 1;
          timers.push(setTimeout(advance, PASS_DWELL));
        }, ACTIVE_DWELL)
      );
    };

    if (failIdx >= 0) {
      // run the pre-approval stages, then mark approval blocked
      const pre = STAGES.slice(0, failIdx);
      let pc = 0;
      const drive = () => {
        if (cancelled) return;
        if (pc < pre.length) {
          const def = pre[pc];
          setActiveKey(def.key);
          timers.push(
            setTimeout(() => {
              if (cancelled) return;
              setCompleted((prev) => [...prev, def.key]);
              setActiveKey(null);
              pc += 1;
              timers.push(setTimeout(drive, PASS_DWELL));
            }, ACTIVE_DWELL)
          );
        } else {
          setBlocked(true);
          setActiveKey("approval");
          setFinished(true);
          onComplete?.();
        }
      };
      timers.push(setTimeout(drive, 0));
    } else {
      timers.push(setTimeout(advance, 0));
    }

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [run, failedAtKey, onComplete]);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        {STAGES.map((def) => {
          const isDone = completed.includes(def.key);
          const isActive = activeKey === def.key && !blocked;
          const isFailed = blocked && def.key === "approval";
          const Icon = def.icon;
          return (
            <div key={def.key} className="flex items-center gap-3 text-sm">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${def.key}-${isDone ? "done" : isFailed ? "failed" : isActive ? "active" : "idle"}`}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full",
                    isDone
                      ? "bg-emerald-500 text-background"
                      : isFailed
                        ? "bg-red-500 text-background"
                        : isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                  )}
                >
                  {isDone ? (
                    <CheckIcon className="size-3.5" />
                  ) : isFailed ? (
                    <XCircleIcon className="size-3.5" />
                  ) : isActive ? (
                    <Icon className="size-3.5 animate-spin" />
                  ) : (
                    <Icon className="size-3.5" />
                  )}
                </motion.span>
              </AnimatePresence>
              <span
                className={cn(
                  isActive && "font-medium text-foreground",
                  isDone && "font-medium text-emerald-500",
                  isFailed && "font-medium text-red-500",
                  !isActive && !isDone && !isFailed && "text-muted-foreground"
                )}
              >
                {isFailed ? "Payment declined by safety checks" : def.label} …
              </span>
            </div>
          );
        })}
      </div>

      {finished && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("pt-1 text-sm font-medium", blocked ? "text-red-500" : "text-emerald-500")}
        >
          {blocked
            ? "This payment was declined by your account's safety checks."
            : "Payment approved and ready to send."}
        </motion.p>
      )}
    </div>
  );
}