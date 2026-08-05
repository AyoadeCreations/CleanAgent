import type { Role } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  overseerOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/transactions", label: "Payments" },
  { href: "/dashboard/agents", label: "Automations" },
  { href: "/dashboard/compliance", label: "Account health", overseerOnly: true },
  { href: "/dashboard/reports", label: "Activity" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function navItemsFor(role: Role): NavItem[] {
  const isOverseer = role === "COMPLIANCE" || role === "ADMIN";
  return NAV_ITEMS.filter((item) => !item.overseerOnly || isOverseer);
}

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
}
