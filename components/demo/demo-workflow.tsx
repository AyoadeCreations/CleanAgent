"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  RocketIcon,
  FingerprintIcon,
  CoinsIcon,
  BotIcon,
  ScaleIcon,
  ArrowLeftRightIcon,
  LandmarkIcon,
  FileCheck2Icon,
  CheckIcon,
  Loader2Icon,
  ShieldAlertIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

type StepKey = "merchant" | "cvi" | "cva" | "agent" | "rules" | "transaction" | "settlement" | "audit";

interface StepMeta {
  key: StepKey;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: StepMeta[] = [
  { key: "merchant", label: "Welcome", description: "Meet your business", icon: RocketIcon },
  { key: "cvi", label: "Verify your business", description: "Confirm who you are", icon: FingerprintIcon },
  { key: "cva", label: "Check your funds", description: "Make sure you can pay", icon: CoinsIcon },
  { key: "agent", label: "Create automation", description: "Set a payment limit", icon: BotIcon },
  { key: "rules", label: "Choose safety checks", description: "Decide what's allowed", icon: ScaleIcon },
  { key: "transaction", label: "Create a payment", description: "Enter amount and recipient", icon: ArrowLeftRightIcon },
  { key: "settlement", label: "Approve & send", description: "Release the funds", icon: LandmarkIcon },
  { key: "audit", label: "Download the report", description: "Keep your records", icon: FileCheck2Icon },
];

const STATUS_LINE = [
  "Business verified",
  "Funds checked",
  "Safety checks passed",
  "Payment approved",
  "Payment sent",
  "Activity recorded",
];

interface StepResult {
  step: StepKey;
  [key: string]: unknown;
}

type Results = Partial<Record<StepKey, StepResult>>;

interface DemoInput {
  name: string;
  industry: string;
  agentName: string;
  dailyLimit: number;
  amount: number;
  assetType: string;
  receiver: string;
  reference: string;
}

const DEFAULT_INPUT: DemoInput = {
  name: "BluePeak Logistics",
  industry: "Freight & logistics",
  agentName: "Payroll Agent",
  dailyLimit: 10_000,
  amount: 4_200,
  assetType: "USDC",
  receiver: "",
  reference: "INV-2026-001",
};

async function callDemo(step: StepKey, input: DemoInput): Promise<StepResult> {
  const res = await fetch("/api/demo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step, input }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error ?? "Demo step failed");
  return json.data as StepResult;
}

export function DemoWorkflow() {
  const [started, setStarted] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [input, setInput] = React.useState<DemoInput>(DEFAULT_INPUT);
  const [results, setResults] = React.useState<Results>({});
  const [loading, setLoading] = React.useState(false);
  const [running, setRunning] = React.useState<StepKey | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const step = STEPS[stepIndex];
  const result = results[step.key];
  const isLast = stepIndex === STEPS.length - 1;
  const txResult = results.transaction;

  function update<K extends keyof DemoInput>(key: K, value: DemoInput[K]) {
    setInput((i) => ({ ...i, [key]: value }));
  }

  async function runCurrent() {
    setError(null);
    setLoading(true);
    setRunning(step.key);
    try {
      const res = await callDemo(step.key, input);
      setResults((r) => ({ ...r, [step.key]: res }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Step failed");
    } finally {
      setLoading(false);
      setRunning(null);
    }
  }

  function next() {
    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1);
  }

  function back() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  function restart() {
    setStarted(false);
    setStepIndex(0);
    setResults({});
    setInput(DEFAULT_INPUT);
    setError(null);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      {!started ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl"
        >
          <div className="rounded-2xl border bg-card p-8 sm:p-10">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SparklesIcon className="size-6" />
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight">Send your first payment</h1>
            <p className="mt-3 text-muted-foreground">
              A guided walkthrough of how a payment goes from request to sent — verify your
              business, create the payment, approve it, and download your record. No account required.
            </p>
            <ol className="mt-8 space-y-2">
              {STEPS.map((s, i) => (
                <li key={s.key} className="flex items-center gap-3 text-sm">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[11px]">
                    {i + 1}
                  </span>
                  <span className="font-medium">{s.label}</span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">· {s.description}</span>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <Button size="lg" onClick={() => setStarted(true)} className="w-full sm:w-auto">
                <RocketIcon />
                Start the walkthrough
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(Object.keys(results).length / STEPS.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {Object.keys(results).length}/{STEPS.length} complete
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border bg-card p-4">
              <ol className="space-y-1">
                {STEPS.map((s, i) => {
                  const done = results[s.key] !== undefined;
                  const active = i === stepIndex;
                  const Icon = s.icon;
                  return (
                    <li
                      key={s.key}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        active ? "bg-primary/10 text-primary" : done ? "text-emerald-500" : "text-muted-foreground"
                      )}
                    >
                      {done ? (
                        <CheckIcon className="size-4 shrink-0" />
                      ) : (
                        <Icon className="size-4 shrink-0" />
                      )}
                      <span className={cn("truncate", active && "font-medium")}>{s.label}</span>
                      {active && <span className="ml-auto size-1.5 animate-pulse rounded-full bg-primary" />}
                    </li>
                  );
                })}
              </ol>
              <div className="mt-4 border-t pt-4 text-xs text-muted-foreground">
                Progress{" "}
                <span className="font-mono">
                  {Object.keys(results).length}/{STEPS.length}
                </span>
              </div>
            </div>
          </aside>

          <AnimatePresence mode="wait">
            <motion.section
              key={step.key}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border bg-card"
            >
              <div className="border-b p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <step.icon className="size-5" />
                  </div>
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      Step {stepIndex + 1} of {STEPS.length}
                    </p>
                    <h2 className="text-lg font-semibold tracking-tight">{step.label}</h2>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>

              <div className="p-6">
                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-500">
                    <ShieldAlertIcon className="size-4 shrink-0" />
                    {error}
                  </div>
                )}

                {loading && running === step.key ? (
                  <StepLoading label={step.label} />
                ) : (
                  <>
                    {step.key === "merchant" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="demo-name">Business name</Label>
                          <Input id="demo-name" value={input.name} onChange={(e) => update("name", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="demo-industry">Industry</Label>
                          <Input id="demo-industry" value={input.industry} onChange={(e) => update("industry", e.target.value)} />
                        </div>
                        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                          Documents we&apos;ll check: certificate of incorporation, UEN, beneficial ownership
                        </div>
                      </div>
                    )}

                    {step.key === "cvi" && result && (
                      <StepSuccess
                        title="Business verified"
                        rows={[
                          ["Reference", String(result.reference)],
                          ["Status", "Verified"],
                          ["Documents", (result.documents as string[])?.join(", ")],
                          ["Verification score", `${result.identityScore}/100`],
                        ]}
                      />
                    )}

                    {step.key === "cva" && result && (
                      <StepSuccess
                        title="Funds ready"
                        rows={[
                          ["Reference", String(result.reference)],
                          ["Asset", String(result.assetType)],
                          ["Liquidity", String(result.liquidity)],
                          ["Funds score", `${result.assetScore}/100`],
                        ]}
                      />
                    )}

                    {step.key === "agent" && (
                      <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="demo-agent">Automation name</Label>
                            <Input id="demo-agent" value={input.agentName} onChange={(e) => update("agentName", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="demo-limit">Daily spend limit</Label>
                            <Input
                              id="demo-limit"
                              type="number"
                              value={input.dailyLimit}
                              onChange={(e) => update("dailyLimit", Number(e.target.value))}
                            />
                          </div>
                        </div>
                        {result && (
                          <StepSuccess
                            title="Automation ready"
                            rows={[
                              ["Automation ID", String(result.agentId)],
                              ["Permissions", (result.permissions as string[])?.join(", ")],
                              ["Monthly limit", formatNumber(result.monthlyLimit as number)],
                            ]}
                          />
                        )}
                      </div>
                    )}

                    {step.key === "rules" && result && (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          These are the safety checks that will run on every payment you make.
                        </p>
                        {(result.rules as Array<{ name: string; type: string; action: string; priority: number }>).map((r) => (
                          <div key={r.type} className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-2.5 text-sm">
                            <div>
                              <span className="font-medium">{r.name}</span>
                              <span className="ml-2 font-mono text-xs text-muted-foreground">{r.type.toLowerCase()}</span>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-mono",
                                r.action === "BLOCK"
                                  ? "bg-red-500/10 text-red-500"
                                  : "bg-amber-500/10 text-amber-500"
                              )}
                            >
                              {r.action.toLowerCase()}
                            </Badge>
                          </div>
                        ))}
                        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                          Choose which receivers to allow, set a per-payment cap, and let safety checks decline risky payments.
                        </div>
                      </div>
                    )}

                    {step.key === "transaction" && (
                      <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="demo-amount">Amount ({input.assetType})</Label>
                            <Input
                              id="demo-amount"
                              type="number"
                              value={input.amount}
                              onChange={(e) => update("amount", Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="demo-ref">Reference</Label>
                            <Input id="demo-ref" value={input.reference} onChange={(e) => update("reference", e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="demo-receiver">Receiver wallet (optional — blank uses a verified supplier)</Label>
                          <Input
                            id="demo-receiver"
                            className="font-mono"
                            placeholder="0x…"
                            value={input.receiver}
                            onChange={(e) => update("receiver", e.target.value)}
                          />
                        </div>

                        {txResult && (
                          <div
                            className={cn(
                              "rounded-xl border p-4",
                              txResult.approved ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className={cn("font-mono text-lg font-semibold", txResult.approved ? "text-emerald-500" : "text-red-500")}>
                                  {txResult.approved ? "Approved" : "Declined"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {txResult.approved ? "All safety checks passed" : "A safety check was not passed"}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {(txResult.decisions as Array<{ ruleName: string; result: string; reason: string }>).map((d, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className={cn(
                                      "font-mono",
                                      d.result === "ALLOW" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                    )}
                                  >
                                    {d.result === "ALLOW" ? "✓" : "✗"} {d.ruleName.toLowerCase()}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            {!txResult.approved && (
                              <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
                                <ShieldAlertIcon className="size-3.5" />
                                {String(txResult.message)} Try a lower amount or a verified receiver.
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button onClick={runCurrent} disabled={loading}>
                            {txResult ? "Re-check" : "Check payment"}
                          </Button>
                          {Boolean(txResult?.approved) && (
                            <Button onClick={next} className="ml-auto">
                              Approve & send <ArrowRightIcon />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {step.key === "settlement" && result && (
                      <StepSuccess
                        title="Payment sent"
                        rows={[
                          ["Reference", String(result.reference)],
                          ["Amount", `${formatNumber(result.amount as number)} ${result.assetType}`],
                          ["Payment ID", String(result.settlementRef)],
                          ["Network fee", `${formatNumber(result.fee as number)} ${result.assetType}`],
                        ]}
                      />
                    )}

                    {step.key === "audit" && result && (
                      <div className="space-y-5">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <AuditStat label="Money sent" value={formatNumber(result.totalVolume as number)} />
                          <AuditStat label="Payments" value={String(result.transactions)} />
                          <AuditStat label="Flagged" value={String(result.flags)} />
                          <AuditStat label="Declined" value={String(result.blocked)} />                        </div>
                        <div className="rounded-lg border bg-muted/30 p-3">
                          <div className="text-xs text-muted-foreground">Record identifier</div>
                          <div className="mt-1 break-all font-mono text-xs text-emerald-500">{String(result.reportHash)}</div>
                        </div>
                        <div className="rounded-xl border bg-emerald-500/5 p-6 text-center">
                          <motion.div
                            initial={{ scale: 0, rotate: -30 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                            className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500 text-background"
                          >
                            <CheckIcon className="size-8" />
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                          >
                            <p className="mt-4 text-lg font-semibold text-emerald-500">Payment completed</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Your payment was verified, approved, and sent — and your record is ready to download.
                            </p>
                          </motion.div>
                          <ul className="mx-auto mt-5 max-w-md space-y-2 text-left">
                            {STATUS_LINE.map((line, i) => (
                              <motion.li
                                key={line}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.35 + i * 0.08 }}
                                className="flex items-center gap-2 rounded-lg border bg-background/60 px-3 py-2 text-sm"
                              >
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                                  <CheckIcon className="size-3.5" />
                                </span>
                                {line}
                                <span className="ml-auto font-mono text-[11px] text-emerald-500">✓</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button nativeButton={false} render={<Link href="/reports" />}>
                            <FileCheck2Icon />
                            View your record
                          </Button>
                          <Button variant="outline" onClick={restart}>
                            Run again
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t p-6">
                <Button variant="ghost" onClick={back} disabled={stepIndex === 0 || loading}>
                  <ArrowLeftIcon />
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  {isLast && result ? (
                    <Button onClick={restart}>
                      <RocketIcon />
                      Restart walkthrough
                    </Button>
                  ) : step.key === "transaction" ? null : step.key === "audit" ? (
                    <Button onClick={runCurrent} disabled={loading}>
                      <FileCheck2Icon />
                      Generate record
                    </Button>
                  ) : (
                    <Button onClick={runCurrent} disabled={loading}>
                      {result ? "Re-run" : "Run step"}
                    </Button>
                  )}
                  {step.key !== "transaction" && step.key !== "audit" && result && !loading && (
                    <Button onClick={next} disabled={isLast}>
                      Continue <ArrowRightIcon />
                    </Button>
                  )}
                </div>
              </div>
            </motion.section>
          </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

function StepLoading({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative">
        <div className="size-14 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <Loader2Icon className="absolute inset-0 m-auto size-5 animate-pulse text-primary" />
      </div>
      <p className="text-sm font-medium">{label}…</p>
      <p className="text-xs text-muted-foreground">Running checks · verifying · recording</p>
    </div>
  );
}

function StepSuccess({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500 text-background">
          <CheckIcon className="size-4" />
        </span>
        <p className="font-semibold text-emerald-500">{title}</p>
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="rounded-lg border bg-background/60 p-3">
            <dt className="text-xs text-muted-foreground">{k}</dt>
            <dd className="mt-0.5 break-all font-mono text-xs">{v}</dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}

function AuditStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-lg font-semibold">{value}</dd>
    </div>
  );
}
