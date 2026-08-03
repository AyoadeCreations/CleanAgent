import type { Metadata } from "next";
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
    </div>
  );
}