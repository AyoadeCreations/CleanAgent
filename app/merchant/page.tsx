import type { Metadata } from "next";
import { requirePageRole } from "@/lib/auth/rbac";
import { RoleHome } from "@/components/dashboard/role-home";

export const metadata: Metadata = { title: "Merchant" };

export default async function MerchantHomePage() {
  const user = await requirePageRole(["MERCHANT"]);

  return (
    <div className="mx-auto max-w-6xl">
      <RoleHome role="MERCHANT" verified={user.verified} />
    </div>
  );
}
