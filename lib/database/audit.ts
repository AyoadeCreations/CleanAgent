import { db } from "@/lib/database/client";

export interface AuditInput {
  actorId?: string;
  actorRole?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  transactionId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export async function writeAuditLog(input: AuditInput) {
  return db.auditLog.create({
    data: {
      actorId: input.actorId,
      actorRole: input.actorRole,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      transactionId: input.transactionId,
      metadata: (input.metadata ?? {}) as object,
      ipAddress: input.ipAddress,
    },
  });
}
