import type { Metadata } from "next";
import { requirePageRole } from "@/lib/auth/rbac";
import { MerchantDashboard } from "@/components/dashboard/merchant-dashboard";

export const metadata: Metadata = { title: "Merchant" };

export default async function MerchantHomePage() {
  const user = await requirePageRole(["MERCHANT"]);

  return (
    <div className="mx-auto max-w-6xl">
      <MerchantDashboard userName={user.name ?? undefined} verified={user.verified} />
    </div>
  );
}
