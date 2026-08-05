import type { Metadata } from "next";
import { requirePageRole } from "@/lib/auth/rbac";
import { BusinessDashboard } from "@/components/dashboard/business-dashboard";

export const metadata: Metadata = { title: "Business" };

export default async function BusinessHomePage() {
  const user = await requirePageRole(["BUSINESS"]);

  return (
    <div className="mx-auto max-w-6xl">
      <BusinessDashboard userName={user.name ?? undefined} verified={user.verified} />
    </div>
  );
}
