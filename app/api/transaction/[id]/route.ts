import { NextRequest } from "next/server";
import { db } from "@/lib/database/client";
import { fail, ok, readJson, requireApiUser, ApiError } from "@/lib/api";
import { writeAuditLog } from "@/lib/database/audit";
import { toTransactionDto } from "@/lib/database/mappers";
import type { TransactionStatus } from "@/lib/types";

const ACTIONS: Record<string, TransactionStatus> = {
  SUSPEND: "SUSPENDED",
  RELEASE: "APPROVED",
  BLOCK: "BLOCKED",
  APPROVE: "APPROVED",
};

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const body = await readJson(request);
    const action = typeof body.action === "string" ? body.action.toUpperCase() : "";

    const transaction = await db.transaction.findUnique({ where: { id } });
    if (!transaction) throw new ApiError("NOT_FOUND", 404, "Transaction not found.");

    const status = ACTIONS[action];
    if (!status) throw new ApiError("INVALID_ACTION", 400, "Action must be SUSPEND, RELEASE, BLOCK or APPROVE.");

    const isOverseer = user.role === "COMPLIANCE" || user.role === "ADMIN";
    const isOwner =
      transaction.sender.toLowerCase() === user.walletAddress.toLowerCase() ||
      transaction.receiver.toLowerCase() === user.walletAddress.toLowerCase();

    if (action === "SUSPEND" || action === "RELEASE" || action === "BLOCK") {
      if (!isOverseer) throw new ApiError("FORBIDDEN", 403, "Only compliance officers can suspend, release or block transactions.");
    }
    if (action === "APPROVE" && !isOverseer && !isOwner) {
      throw new ApiError("FORBIDDEN", 403, "You cannot approve this transaction.");
    }

    const updated = await db.transaction.update({
      where: { id },
      data: { status },
      include: { agent: { select: { name: true } } },
    });

    await writeAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: `TRANSACTION_${action}`,
      resourceType: "transaction",
      resourceId: id,
      transactionId: id,
      metadata: { from: transaction.status, to: status },
      ipAddress: request.headers.get("x-forwarded-for") ?? "local",
    });

    return ok({ transaction: toTransactionDto(updated) });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[transaction/update]", error);
    return fail("Failed to update transaction", 500, "INTERNAL");
  }
}
