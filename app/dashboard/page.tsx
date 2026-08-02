import type { Metadata } from "next";
import { Overview } from "@/components/dashboard/overview";

export const metadata: Metadata = {
  title: "Overview",
  description: "CleanFlow dashboard overview",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trust, compliance, and payment activity across your workspace.
        </p>
      </div>
      <Overview />
    </div>
  );
}
