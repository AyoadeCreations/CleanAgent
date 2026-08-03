export type Role = "MERCHANT" | "BUSINESS" | "COMPLIANCE" | "ADMIN";

export type VerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";

export type BusinessStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

export type AgentStatus = "ACTIVE" | "PAUSED" | "SUSPENDED" | "DEACTIVATED";

export type TransactionStatus =
  | "PENDING"
  | "APPROVED"
  | "EXECUTED"
  | "FAILED"
  | "BLOCKED"
  | "SUSPENDED";

export type TransactionType = "PAYMENT" | "PAYROLL" | "SUPPLIER" | "ESCROW" | "TREASURY";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AssetKind = "TOKEN" | "NFT" | "RECEIVABLE" | "POINT";

export interface SessionUser {
  id: string;
  walletAddress: string;
  email: string | null;
  name: string | null;
  role: Role;
  verified: boolean;
  kycLevel: number;
}

export interface UserDTO extends SessionUser {
  verificationStatus: VerificationStatus;
  createdAt: string;
}

export interface ApiError {
  error: string;
  message?: string;
  code?: string;
}

export interface AgentDTO {
  id: string;
  name: string;
  description: string | null;
  businessId: string | null;
  businessName: string | null;
  walletAddress: string | null;
  dailyLimit: number;
  monthlyLimit: number;
  permissions: AgentPermissions;
  status: AgentStatus;
  lastUsedAt: string | null;
  createdAt: string;
  transactionCount: number;
}

export interface AgentPermissions {
  actions: string[];
  spendLimit: number;
  allowlist: string[];
}

export interface TransactionDTO {
  id: string;
  sender: string;
  receiver: string;
  amount: number;
  assetType: string;
  riskScore: number;
  riskLevel: RiskLevel;
  status: TransactionStatus;
  type: TransactionType;
  reference: string | null;
  agentId: string | null;
  agentName: string | null;
  createdAt: string;
  auditHash: string | null;
  decisions: Array<{ rule: string; result: string }>;
}

export interface RuleDTO {
  id: string;
  name: string;
  description: string | null;
  type: string;
  conditions: Record<string, unknown>;
  action: string;
  priority: number;
  enabled: boolean;
  createdAt: string;
}

export interface ComplianceSummary {
  totalVolume: number;
  verifiedUsers: number;
  activeAgents: number;
  complianceScore: number;
  pendingReviews: number;
  blockedTransactions: number;
  flagsRaised: number;
}

export interface DashboardSummary {
  overview: {
    totalVolume: number;
    verifiedUsers: number;
    activeAgents: number;
    complianceScore: number;
    transactionCount: number;
    pendingCount: number;
    blockedCount: number;
    settlements: number;
  };
  trends: {
    volumePercent: number;
    transactionsPercent: number;
    settlementsPercent: number;
    agentsPercent: number;
    verifiedPercent: number;
    complianceDelta: number;
  };
  volumeByType: Array<{ type: TransactionType; volume: number; count: number }>;
  volumeByDay: Array<{ date: string; volume: number; count: number }>;
  riskDistribution: Array<{ riskLevel: RiskLevel; count: number }>;
}
