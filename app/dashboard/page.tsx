import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Overview } from "@/components/dashboard/overview";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { QuickActions } from "@/components/dashboard/quick-actions";

export const metadata: Metadata = {
  title: "Overview",
  description: "CleanFlow dashboard overview",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-12">
      <div className="rounded-[24px] bg-gradient-to-br from-blue-600 to-indigo-700 px-10 py-12 text-white shadow-[0_20px_50px_-20px_rgba(37,99,235,0.5)]">
        <p className="text-sm font-medium uppercase tracking-widest text-blue-100">Merchant workspace</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Good to see you, Helios</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-blue-50">
          Here&apos;s the trust, compliance, and payment picture across your workspace — identity,
          assets, rules, settlements, and audit.
        </p>
      </div>

      <Overview />

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityFeed />
        <QuickActions />
      </div>

      <div className="rounded-[24px] bg-card p-8 ring-1 ring-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Reports</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Signed, immutable audit reports for every approved decision.
            </p>
          </div>
          <Link
            href="/dashboard/reports"
            className="group inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            View reports
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}