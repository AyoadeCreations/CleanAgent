import "server-only";
import { createHash } from "node:crypto";
import type { RiskLevel } from "@/lib/types";
import { cleanverseFetch, delay, riskScoreToLevel, withFallback } from "./client";
import { calculateRiskScore } from "./risk";

export interface RuleLike {
  id: string;
  name: string;
  type: string;
  action: string;
  conditions: Record<string, unknown>;
  enabled: boolean;
}

export interface TransactionInput {
  sender: string;
  receiver: string;
  amount: number;
  assetType: string;
  reference?: string;
  agentId?: string | null;
  dailyLimit?: number;
  riskScore?: number;
}

export interface RuleDecision {
  ruleId: string;
  ruleName: string;
  ruleType: string;
  result: "ALLOW" | "BLOCK" | "FLAG";
  reason: string;
}

export interface ValidationResult {
  approved: boolean;
  riskScore: number;
  riskLevel: RiskLevel;
  flags: string[];
  decisions: RuleDecision[];
  auditHash: string;
}

function evaluateRule(rule: RuleLike, tx: TransactionInput): RuleDecision | null {
  const conditions = rule.conditions ?? {};
  const field = conditions.field as string | undefined;
  const operator = conditions.operator as string | undefined;
  const value = conditions.value as unknown;

  const actual = field ? (tx as unknown as Record<string, unknown>)[field] : undefined;

  let matches = false;
  switch (operator) {
    case "in":
      matches = Array.isArray(value) && typeof actual === "string" && value.includes(actual);
      break;
    case "not_in":
      matches = Array.isArray(value) && typeof actual === "string" && !value.includes(actual);
      break;
    case "eq":
      matches = actual === value;
      break;
    case "neq":
      matches = actual !== value;
      break;
    case "lt":
      matches = typeof actual === "number" && typeof value === "number" && actual < value;
      break;
    case "lte":
      matches = typeof actual === "number" && typeof value === "number" && actual <= value;
      break;
    case "gt":
      matches = typeof actual === "number" && typeof value === "number" && actual > value;
      break;
    case "gte":
      matches = typeof actual === "number" && typeof value === "number" && actual >= value;
      break;
    default:
      return null;
  }

  const ruleType = rule.type;

  if (ruleType === "ALLOWLIST") {
    // Deny-by-default: receivers outside the allowlist are blocked.
    if (!matches) {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        ruleType,
        result: "BLOCK",
        reason: `Receiver is not in the approved counterparty allowlist.`,
      };
    }
    return { ruleId: rule.id, ruleName: rule.name, ruleType, result: "ALLOW", reason: "Receiver is allowlisted." };
  }

  if (ruleType === "BLOCKLIST") {
    if (matches) {
      return { ruleId: rule.id, ruleName: rule.name, ruleType, result: "BLOCK", reason: "Receiver matches a blocklisted address." };
    }
    return null;
  }

  if (ruleType === "MAX_AMOUNT") {
    // Condition declares the allowed maximum (op lte). Exceeding it blocks.
    if (matches) return null;
    return { ruleId: rule.id, ruleName: rule.name, ruleType, result: "BLOCK", reason: `Amount exceeds the configured cap.` };
  }

  if (ruleType === "SPEND_LIMIT") {
    if (typeof tx.dailyLimit === "number" && tx.dailyLimit > 0 && tx.amount > tx.dailyLimit) {
      return { ruleId: rule.id, ruleName: rule.name, ruleType, result: "BLOCK", reason: "Amount exceeds the agent daily spend limit." };
    }
    return null;
  }

  if (ruleType === "RISK_THRESHOLD") {
    // Condition declares the tolerated maximum risk (op lt). Above it the tx is flagged.
    if (matches) return null;
    return { ruleId: rule.id, ruleName: rule.name, ruleType, result: "FLAG", reason: "Transaction risk score exceeds the acceptable threshold." };
  }

  return null;
}

function mockValidation(tx: TransactionInput, rules: RuleLike[]): ValidationResult {
  const riskScore = calculateRiskScore({
    sender: tx.sender,
    receiver: tx.receiver,
    amount: tx.amount,
    assetType: tx.assetType,
    reference: tx.reference,
    isVerified: true,
    assetVerified: true,
  });

  const decisions: RuleDecision[] = [];
  for (const rule of rules) {
    if (!rule.enabled) continue;
    const decision = evaluateRule(rule, { ...tx, riskScore, dailyLimit: tx.dailyLimit });
    if (decision) decisions.push(decision);
  }

  const flags = decisions.filter((d) => d.result === "FLAG").map((d) => d.reason);
  const hasBlock = decisions.some((d) => d.result === "BLOCK");
  const riskLevel = riskScoreToLevel(riskScore);

  return {
    approved: !hasBlock,
    riskScore,
    riskLevel,
    flags,
    decisions,
    auditHash: generateAuditHash("validate", tx),
  };
}

/**
 * Validate a transaction against Cleanverse Compliance Policies (CCP)
 * and the tenant's configured rules.
 */
export async function validateTransaction(
  tx: TransactionInput,
  rules: RuleLike[] = [],
): Promise<ValidationResult> {
  await delay(320);
  return withFallback(
    async () => {
      const res = await cleanverseFetch<ValidationResult>("/v1/ccp/validate", {
        method: "POST",
        body: JSON.stringify({ transaction: tx, rules }),
      });
      return res;
    },
    () => mockValidation(tx, rules),
  );
}

/** Alias used by the demo and dashboard for a full transaction evaluation. */
export const evaluateTransaction = validateTransaction;

export function generateAuditHash(action: string, resource: object): string {
  const payload = JSON.stringify({ action, resource, nonce: Date.now() });
  return createHash("sha256").update(payload).digest("hex");
}
