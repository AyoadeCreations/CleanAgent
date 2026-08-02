import type { Transaction } from "@/lib/generated/prisma/client";
import type { TransactionDTO } from "@/lib/types";

export function toTransactionDto(t: Transaction & { agent?: { name: string } | null }): TransactionDTO {
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
  };
}
