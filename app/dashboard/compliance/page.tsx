import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth/session";
import { ComplianceView } from "@/components/dashboard/compliance-view";

export const metadata: Metadata = {
  title: "Compliance",
  description: "Compliance monitoring",
};

export default async function CompliancePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "COMPLIANCE" && user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Compliance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Policy rules, audit trail, and review queue.
        </p>
      </div>
      <ComplianceView />
    </div>
  );
}
