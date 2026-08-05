"use client";

import Link from "next/link";
import {
  FileTextIcon,
  FileBarChart2Icon,
  BotIcon,
  FingerprintIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  {
    icon: FileTextIcon,
    title: "Send a payment",
    detail: "Start a payment from your workspace",
    href: "/dashboard/transactions",
    tone: "bg-blue-50 text-blue-600",
  },
  {
    icon: FileBarChart2Icon,
    title: "Create activity record",
    detail: "Keep a secure history of your payments",
    href: "/dashboard/reports",
    tone: "bg-rose-50 text-rose-600",
  },
  {
    icon: BotIcon,
    title: "Create automation",
    detail: "Automate payments within your limits",
    href: "/dashboard/agents",
    tone: "bg-violet-50 text-violet-600",
  },
  {
    icon: FingerprintIcon,
    title: "Verify your business",
    detail: "Complete business verification",
    href: "/onboarding",
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: ShieldCheckIcon,
    title: "Review payments",
    detail: "Check what needs your attention",
    href: "/dashboard/compliance",
    tone: "bg-amber-50 text-amber-600",
  },
];

export function QuickActions() {
  return (
    <div className="rounded-[24px] bg-card p-8 ring-1 ring-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
      <h3 className="text-lg font-semibold tracking-tight">Quick actions</h3>
      <p className="mt-1 text-sm text-muted-foreground">Common tasks, one click away</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group flex items-center gap-4 rounded-2xl border p-4 transition-colors hover:border-primary/40 hover:bg-surface/50"
          >
            <span className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-xl", action.tone)}>
              <action.icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{action.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{action.detail}</p>
            </div>
            <ArrowRightIcon className="size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </div>
  );
}