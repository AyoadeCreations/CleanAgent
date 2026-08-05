"use client";

import type { Role } from "@/lib/types";
import { MerchantDashboard } from "@/components/dashboard/merchant-dashboard";
import { BusinessDashboard } from "@/components/dashboard/business-dashboard";
import { ComplianceDashboard } from "@/components/dashboard/compliance-dashboard";

export function RoleDashboard({
  role,
  userName,
  verified,
}: {
  role: Role;
  userName?: string;
  verified: boolean;
}) {
  switch (role) {
    case "MERCHANT":
      return <MerchantDashboard userName={userName} verified={verified} />;
    case "BUSINESS":
      return <BusinessDashboard userName={userName} verified={verified} />;
    case "COMPLIANCE":
    case "ADMIN":
      return <ComplianceDashboard userName={userName} verified={verified} />;
    default:
      return <MerchantDashboard userName={userName} verified={verified} />;
  }
}