import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth/session";
import { RoleHome } from "@/components/dashboard/role-home";

export const metadata: Metadata = { title: "Compliance" };

export default async function ComplianceHomePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-6xl">
      <RoleHome role="COMPLIANCE" verified={user.verified} />
    </div>
  );
}
