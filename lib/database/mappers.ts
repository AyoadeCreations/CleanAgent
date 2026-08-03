import type { Transaction } from "@/lib/generated/prisma/client";
import type { TransactionDTO } from "@/lib/types";

export function toTransactionDto(t: Transaction & { agent?: { name: string } | null }): TransactionDTO {
  const meta = (t.metadata ?? {}) as Record<string, unknown>;
  const decisions = Array.isArray(meta.decisions) ? (meta.decisions as Array<Record<string, unknown>>) : [];
  const auditHash = typeof meta.auditHash === "string" ? meta.auditHash : null;

  return {
    id: t.id,
    sender: t.sender,
    receiver: t.receiver,
    amount: t.amount,
    assetType: t.assetType,
    riskScore: t.riskScore,
    riskLevel: t.riskLevel,
    status: t.status,
    type: t.type,
    reference: t.reference,
    agentId: t.agentId,
    agentName: t.agent?.name ?? null,
    createdAt: t.createdAt.toISOString(),
    auditHash,
    decisions: decisions.map((d) => ({
      rule: String(d.rule ?? ""),
      result: String(d.result ?? ""),
    })),
  };
}
