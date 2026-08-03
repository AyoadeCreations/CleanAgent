import type { Role, TransactionStatus, RiskLevel, TransactionType } from "@/lib/types";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "CleanFlow";
export const APP_TAGLINE = process.env.NEXT_PUBLIC_APP_TAGLINE ?? "Trust Every Transaction";
export const APP_CHAIN = process.env.NEXT_PUBLIC_CHAIN ?? "MONAD";

export function roleHome(role: Role): string {
  switch (role) {
    case "BUSINESS":
      return "/business";
    case "COMPLIANCE":
      return "/compliance";
    case "ADMIN":
      return "/dashboard";
    default:
      return "/merchant";
  }
}

export const DEMO_ACCOUNTS: Array<{ role: Role; email: string; label: string; description: string }> = [
  {
    role: "MERCHANT",
    email: "merchant@cleanflow.dev",
    label: "Merchant",
    description: "Receive payments, invoices, and settlements.",
  },
  {
    role: "BUSINESS",
    email: "business@cleanflow.dev",
    label: "Business",
    description: "Suppliers, payroll runs, agents, and rules.",
  },
  {
    role: "COMPLIANCE",
    email: "compliance@cleanflow.dev",
    label: "Compliance",
    description: "Monitor, audit, and suspend activity.",
  },
  {
    role: "ADMIN",
    email: "admin@cleanflow.dev",
    label: "Admin",
    description: "Platform-wide visibility and control.",
  },
];

export const ROLES: Record<Role, { label: string; description: string }> = {
  MERCHANT: { label: "Merchant", description: "Receive payments, create invoices, review settlements." },
  BUSINESS: { label: "Business", description: "Manage suppliers, payroll, agents and compliance rules." },
  COMPLIANCE: { label: "Compliance", description: "Monitor transactions, review audit logs, suspend activity." },
  ADMIN: { label: "Admin", description: "Platform administration and full visibility." },
};

export const TRANSACTION_STATUS_META: Record<
  TransactionStatus,
  { label: string; tone: "default" | "secondary" | "success" | "warning" | "danger" | "info" }
> = {
  PENDING: { label: "Pending", tone: "warning" },
  APPROVED: { label: "Approved", tone: "info" },
  EXECUTED: { label: "Executed", tone: "success" },
  FAILED: { label: "Failed", tone: "danger" },
  BLOCKED: { label: "Blocked", tone: "danger" },
  SUSPENDED: { label: "Suspended", tone: "warning" },
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  PAYMENT: "Payment",
  PAYROLL: "Payroll",
  SUPPLIER: "Supplier",
  ESCROW: "Escrow",
  TREASURY: "Treasury",
};

export const RISK_LEVEL_META: Record<RiskLevel, { label: string; color: string }> = {
  LOW: { label: "Low", color: "text-emerald-600 dark:text-emerald-400" },
  MEDIUM: { label: "Medium", color: "text-amber-600 dark:text-amber-400" },
  HIGH: { label: "High", color: "text-orange-600 dark:text-orange-400" },
  CRITICAL: { label: "Critical", color: "text-red-600 dark:text-red-400" },
};

export const AGENT_PERMISSIONS = [
  { value: "TRANSFER", label: "Transfers" },
  { value: "PAYMENT", label: "Payments" },
  { value: "PAYROLL", label: "Payroll" },
  { value: "SUPPLIER_PAYMENT", label: "Supplier payments" },
  { value: "TREASURY_MOVE", label: "Treasury moves" },
  { value: "INVOICE", label: "Invoices" },
  { value: "READ", label: "Read-only" },
  { value: "ANALYZE", label: "Analysis" },
] as const;

export const RULE_TYPES = [
  { value: "ALLOWLIST", label: "Counterparty allowlist" },
  { value: "BLOCKLIST", label: "Sanctions blocklist" },
  { value: "MAX_AMOUNT", label: "Per-transaction cap" },
  { value: "RISK_THRESHOLD", label: "Risk score threshold" },
  { value: "SPEND_LIMIT", label: "Spend limit" },
  { value: "TIME_WINDOW", label: "Time window" },
] as const;

export const ASSET_TYPES = ["USDC", "WMON", "MON", "RECEIVABLE", "NFT"] as const;

// Monad testnet chain configuration.
export const MONAD_TESTNET = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC ?? "https://testnet-rpc.monad.xyz"],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC ?? "https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: { name: "Monad Explorer", url: "https://testnet.monadexplorer.com" },
  },
} as const;
