import type { Metadata } from "next";
import { requirePageRole } from "@/lib/auth/rbac";
import { RoleHome } from "@/components/dashboard/role-home";

export const metadata: Metadata = { title: "Business" };

export default async function BusinessHomePage() {
  const user = await requirePageRole(["BUSINESS"]);

  return (
    <div className="mx-auto max-w-6xl">
      <RoleHome role="BUSINESS" verified={user.verified} />
    </div>
  );
}
