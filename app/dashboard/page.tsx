import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";
import { Overview } from "@/components/dashboard/overview";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { getSessionUser } from "@/lib/auth/session";
import { ROLE_LABEL, ROLE_TAGLINE, greeting } from "@/lib/world";

export const metadata: Metadata = {
  title: "Overview",
  description: "CleanFlow dashboard overview",
};

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const firstName = user.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      <div className="rounded-[24px] bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-10 text-white shadow-[0_20px_50px_-20px_rgba(37,99,235,0.5)] sm:px-10">
        <p className="text-sm font-medium uppercase tracking-widest text-blue-100">{ROLE_LABEL[user.role]}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {greeting()}, {firstName}
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-blue-50">
          {ROLE_TAGLINE[user.role]} Here&apos;s the payment and account picture across your workspace.
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
            <h3 className="text-lg font-semibold tracking-tight">Activity history</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Clean, shareable records for every payment you make.
            </p>
          </div>
          <Link
            href="/dashboard/reports"
            className="group inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            View activity
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}