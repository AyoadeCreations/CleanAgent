import type { Metadata } from "next";
import { requirePageRole } from "@/lib/auth/rbac";
import { ComplianceDashboard } from "@/components/dashboard/compliance-dashboard";

export const metadata: Metadata = { title: "Account health" };

export default async function ComplianceHomePage() {
  const user = await requirePageRole(["COMPLIANCE", "ADMIN"]);

  return (
    <div className="mx-auto max-w-6xl">
      <ComplianceDashboard userName={user.name ?? undefined} verified={user.verified} />
    </div>
  );
}
