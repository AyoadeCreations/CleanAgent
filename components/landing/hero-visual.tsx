"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  StoreIcon,
  FingerprintIcon,
  CoinsIcon,
  ScaleIcon,
  LandmarkIcon,
  FileCheck2Icon,
  CheckIcon,
  Loader2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  { label: "Business", detail: "Set up · welcome", icon: StoreIcon, tone: "text-sky-400" },
  { label: "Business verified", detail: "Identity confirmed", icon: FingerprintIcon, tone: "text-emerald-400" },
  { label: "Funds checked", detail: "Funds verified", icon: CoinsIcon, tone: "text-emerald-400" },
  { label: "Safety checks", detail: "Rules reviewed", icon: ScaleIcon, tone: "text-amber-400" },
  { label: "Payment sent", detail: "Funds released", icon: LandmarkIcon, tone: "text-blue-400" },
  { label: "Activity recorded", detail: "Record saved", icon: FileCheck2Icon, tone: "text-violet-400" },
] as const;

const CYCLE_MS = 620;
const TOTAL = STAGES.length;

export function HeroVisual() {
  const [active, setActive] = React.useState(0);
  const [holding, setHolding] = React.useState(false);

  React.useEffect(() => {
    if (holding) return;
    const id = setInterval(() => setActive((a) => (a + 1) % (TOTAL + 1)), CYCLE_MS);
    return () => clearInterval(id);
  }, [holding]);

  return (
    <div
      className="relative w-full max-w-md"
      onMouseEnter={() => setHolding(true)}
      onMouseLeave={() => setHolding(false)}
    >
      <div
        className="pointer-events-none absolute -inset-6 -z-10"
        aria-hidden="true"
        style={{
          background: "radial-gradient(60% 50% at 50% 20%, oklch(0.55 0.2 255 / 0.1), transparent 70%)",
        }}
      />

      <div className="rounded-[24px] border bg-card p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Payment flow
            </p>
            <p className="mt-0.5 text-sm font-medium">Live payment status</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-500">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            live
          </span>
        </div>

        <ol className="relative">
          {STAGES.map((stage, i) => {
            const done = active > i;
            const isActive = active === i;
            const Icon = stage.icon;
            return (
              <motion.li
                key={stage.label}
                initial={false}
                animate={isActive ? { scale: 1.02 } : { scale: 1 }}
                className="relative flex items-center gap-3 pb-5 last:pb-0"
              >
                {i < STAGES.length - 1 && (
                  <span className="absolute top-9 left-[19px] h-[calc(100%-18px)] w-px bg-border" aria-hidden="true" />
                )}
                <span
                  className={cn(
                    "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300",
                    done
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                      : isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {done ? (
                    <CheckIcon className="size-4" />
                  ) : isActive ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <Icon className="size-4" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        "text-sm font-medium transition-colors",
                        done ? "text-foreground" : isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {stage.label}
                    </p>
                    <span
                      className={cn(
                        "shrink-0 font-mono text-[10px] uppercase tracking-wider transition-colors",
                        done ? "text-emerald-500" : isActive ? "text-primary" : "text-muted-foreground/60",
                      )}
                    >
                      {done ? "done" : isActive ? "processing" : "queued"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{stage.detail}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>

        <div className="mt-4 flex items-center justify-between rounded-xl border bg-surface/60 px-3.5 py-2.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Pipeline state</span>
          <span className="font-mono text-xs font-medium text-primary">
            {active > TOTAL - 1 ? "COMPLETE" : `${active}/${TOTAL}`}
          </span>
        </div>
      </div>
    </div>
  );
}
