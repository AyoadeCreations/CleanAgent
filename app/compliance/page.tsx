import type { Metadata } from "next";
import { requirePageRole } from "@/lib/auth/rbac";
import { RoleHome } from "@/components/dashboard/role-home";

export const metadata: Metadata = { title: "Compliance" };

export default async function ComplianceHomePage() {
  const user = await requirePageRole(["COMPLIANCE", "ADMIN"]);

  return (
    <div className="mx-auto max-w-6xl">
      <RoleHome role="COMPLIANCE" verified={user.verified} />
    </div>
  );
}
