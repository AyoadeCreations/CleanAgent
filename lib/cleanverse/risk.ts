import "server-only";
import { createHash } from "node:crypto";
import { hashToRange, riskScoreToLevel } from "./client";

export interface RiskInput {
  sender: string;
  receiver: string;
  amount: number;
  assetType: string;
  reference?: string;
  isVerified?: boolean;
  assetVerified?: boolean;
}

/**
 * Deterministic, mock-first risk score. Combines a stable counterparty
 * baseline with amount, asset, and verification signals.
 */
export function calculateRiskScore(tx: RiskInput): number {
  let score = hashToRange(tx.receiver, 5, 30);
  if (tx.amount > 10_000) score += 12;
  if (tx.amount > 50_000) score += 20;
  if (tx.amount > 100_000) score += 12;
  if (tx.assetType !== "USDC") score += 8;
  if (tx.isVerified === false) score += 18;
  if (tx.assetVerified === false) score += 10;
  if (tx.receiver.toLowerCase().includes("deadbeef")) score += 40;
  score = Math.max(0, Math.min(99, score));
  return score;
}

export interface ReportTransactionLike {
  id: string;
  reference: string | null;
  sender: string;
  receiver: string;
  amount: number;
  assetType: string;
  type: string;
  createdAt: Date | string;
  riskScore: number;
  riskLevel: string;
  status: string;
}

export interface ComplianceReportInput {
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  transactions: ReportTransactionLike[];
}

export interface GeneratedReport {
  data: {
    periodStart: string;
    periodEnd: string;
    totalVolume: number;
    transactions: number;
    flags: number;
    suspensions: number;
    blocked: number;
    generatedBy: string;
    entries: Array<{
      transactionId: string;
      reference: string | null;
      sender: string;
      receiver: string;
      amount: number;
      assetType: string;
      type: string;
      timestamp: string;
      riskScore: number;
      riskLevel: string;
      status: string;
      validation: string;
    }>;
  };
  reportHash: string;
}

/**
 * Build a signed compliance report payload from a set of transactions.
 */
export function generateComplianceReport(input: ComplianceReportInput): GeneratedReport {
  const { transactions, periodStart, periodEnd, userId } = input;

  const totalVolume = transactions
    .filter((t) => t.status === "EXECUTED" || t.status === "APPROVED")
    .reduce((s, t) => s + t.amount, 0);
  const flags = transactions.filter((t) => t.riskScore >= 50).length;
  const suspensions = transactions.filter((t) => t.status === "SUSPENDED").length;
  const blocked = transactions.filter((t) => t.status === "BLOCKED").length;

  const data = {
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    totalVolume,
    transactions: transactions.length,
    flags,
    suspensions,
    blocked,
    generatedBy: userId,
    entries: transactions.map((t) => ({
      transactionId: t.id,
      reference: t.reference,
      sender: t.sender,
      receiver: t.receiver,
      amount: t.amount,
      assetType: t.assetType,
      type: t.type,
      timestamp: (typeof t.createdAt === "string" ? new Date(t.createdAt) : t.createdAt).toISOString(),
      riskScore: t.riskScore,
      riskLevel: t.riskLevel,
      status: t.status,
      validation:
        t.status === "BLOCKED"
          ? "REJECTED"
          : t.status === "SUSPENDED"
            ? "FLAGGED"
            : t.status === "PENDING"
              ? "PENDING"
              : "PASS",
    })),
  };

  return {
    data,
    reportHash: createHash("sha256")
      .update(JSON.stringify({ action: "report", periodStart, periodEnd, totalVolume, userId }))
      .digest("hex"),
  };
}

export { riskScoreToLevel };
