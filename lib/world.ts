import type { Role, TransactionType } from "@/lib/types";

// Consistent product universe for CleanFlow. These identities are used across
// dashboards, activity feeds, and demo flows so every surface tells the same story.
export const WORLD = {
  merchant: {
    name: "BluePeak Logistics",
    tagline: "Cross-border freight and supplier payments",
    firstName: "Roland",
    industry: "Freight & logistics",
  },
  business: {
    name: "Atlas Commerce",
    tagline: "Marketplace treasury, payroll, and supplier operations",
    firstName: "Amara",
    industry: "E-commerce & marketplace",
  },
  compliance: {
    name: "Emma Rodriguez",
    tagline: "Head of compliance operations",
    firstName: "Emma",
  },
  admin: {
    name: "CleanFlow Admin",
    tagline: "Platform administration",
    firstName: "Admin",
  },
} as const;

// Curated counterparties used in tables and feeds.
export const COUNTERPARTIES = [
  { name: "SwiftPay Africa", address: "0x00000000000000000000000000000000000000f1" },
  { name: "Atlas Commerce", address: "0x00000000000000000000000000000000000000f2" },
  { name: "Northstar Capital", address: "0x00000000000000000000000000000000000000f3" },
  { name: "Meridian Trading", address: "0x00000000000000000000000000000000000000f4" },
  { name: "BluePeak Freight", address: "0x00000000000000000000000000000000000000f7" },
  { name: "Northstar Freight", address: "0x00000000000000000000000000000000000000f8" },
] as const;

export function counterpartyName(address: string): string {
  const match = COUNTERPARTIES.find((c) => c.address.toLowerCase() === address.toLowerCase());
  return match?.name ?? "";
}

// Compliance officers across the org.
export const COMPLIANCE_OFFICERS = [
  { name: "Emma Rodriguez", role: "Head of Compliance", initials: "ER" },
  { name: "Michael Chen", role: "AML Officer", initials: "MC" },
  { name: "Sarah Williams", role: "Sanctions Analyst", initials: "SW" },
] as const;

// Payment agents that belong to the tenant.
export const WORLD_AGENTS = [
  { name: "Treasury Agent", description: "Optimizes treasury balances and yield across pools." },
  { name: "Settlement Agent", description: "Settles approved supplier and merchant payments." },
  { name: "Risk Agent", description: "Scores counterparties and re-evaluates policy flags." },
  { name: "Payroll Agent", description: "Runs verified payroll batches within spend limits." },
] as const;

// Assets supported across the platform.
export const WORLD_ASSETS = [
  { symbol: "USDC", label: "USD Coin", kind: "Stablecoin" },
  { symbol: "USDT", label: "Tether", kind: "Stablecoin" },
  { symbol: "TBILL", label: "Treasury Bills", kind: "Real-world asset" },
  { symbol: "INV", label: "Invoice-backed", kind: "Real-world asset" },
  { symbol: "MON", label: "Monad", kind: "Native" },
] as const;

// Type labels used by charts and tables.
export const TYPE_LABELS: Record<TransactionType, string> = {
  PAYMENT: "Payments",
  PAYROLL: "Payroll",
  SUPPLIER: "Suppliers",
  ESCROW: "Escrow",
  TREASURY: "Treasury",
};

// Greeting based on local time, e.g. "Good morning".
export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Good evening";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export const ROLE_LABEL: Record<Role, string> = {
  MERCHANT: "Merchant workspace",
  BUSINESS: "Business workspace",
  COMPLIANCE: "Compliance workspace",
  ADMIN: "Admin workspace",
};

export const ROLE_TAGLINE: Record<Role, string> = {
  MERCHANT: "Receive verified payments, issue invoices, and track settlements.",
  BUSINESS: "Operate agents, enforce policy, and run payroll and suppliers.",
  COMPLIANCE: "Monitor flags, review risk, and keep the audit trail honest.",
  ADMIN: "Platform-wide visibility across identities, transactions, and policy.",
};
