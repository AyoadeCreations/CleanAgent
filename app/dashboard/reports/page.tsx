import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth/session";
import { ReportsView } from "@/components/dashboard/reports-view";

export const metadata: Metadata = {
  title: "Reports",
  description: "Compliance reports",
};

export default async function ReportsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed compliance reports over the last 30 days.
        </p>
      </div>
      <ReportsView />
    </div>
  );
}
