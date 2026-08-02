import { db } from "@/lib/database/client";
import { Prisma } from "@/lib/generated/prisma/client";
import { fail, ok, readJson, requireApiUser, ApiError } from "@/lib/api";
import { validateTransaction, generateAuditHash } from "@/lib/cleanverse";
import { writeAuditLog } from "@/lib/database/audit";
import { toTransactionDto } from "@/lib/database/mappers";
import { riskScoreToLevel } from "@/lib/cleanverse/client";

const WALLET_RE = /^0x[0-9a-fA-F]{40}$/;

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await readJson(request);
    const ipAddress = request.headers.get("x-forwarded-for") ?? "local";

    const receiver = typeof body.receiver === "string" ? body.receiver.trim().toLowerCase() : "";
    const amount = typeof body.amount === "number" ? body.amount : Number(body.amount);
    const assetType = typeof body.assetType === "string" ? body.assetType : "USDC";
    const type = typeof body.type === "string" ? body.type.toUpperCase() : "PAYMENT";
    const reference = typeof body.reference === "string" && body.reference.trim() ? body.reference.trim().toUpperCase() : null;
    const agentId = typeof body.agentId === "string" && body.agentId ? body.agentId : null;

    if (!WALLET_RE.test(receiver)) {
      throw new ApiError("INVALID_RECEIVER", 400, "Receiver must be a valid EVM address.");
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new ApiError("INVALID_AMOUNT", 400, "Amount must be a positive number.");
    }
    if (!["PAYMENT", "PAYROLL", "SUPPLIER", "ESCROW", "TREASURY"].includes(type)) {
      throw new ApiError("INVALID_TYPE", 400, "Unknown transaction type.");
    }

    let sender = user.walletAddress;
    let dailyLimit: number | undefined;

    if (agentId) {
      const agent = await db.agent.findUnique({ where: { id: agentId } });
      if (!agent || agent.ownerId !== user.id) {
        throw new ApiError("AGENT_NOT_FOUND", 404, "Agent not found or not owned by you.");
      }
      if (agent.status !== "ACTIVE") {
        throw new ApiError("AGENT_INACTIVE", 403, "Agent is not active.");
      }
      sender = agent.walletAddress ?? user.walletAddress;
      dailyLimit = agent.dailyLimit;

      // Enforce agent spending limits.
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [dayTotal, monthTotal] = await Promise.all([
        db.transaction.aggregate({
          where: { agentId, createdAt: { gte: startOfDay } },
          _sum: { amount: true },
        }),
        db.transaction.aggregate({
          where: { agentId, createdAt: { gte: startOfMonth } },
          _sum: { amount: true },
        }),
      ]);

      const projectedDay = (dayTotal._sum.amount ?? 0) + amount;
      const projectedMonth = (monthTotal._sum.amount ?? 0) + amount;

      if (agent.dailyLimit > 0 && projectedDay > agent.dailyLimit) {
        throw new ApiError("DAILY_LIMIT_EXCEEDED", 422, `Agent daily limit (${agent.dailyLimit}) would be exceeded.`);
      }
      if (agent.monthlyLimit > 0 && projectedMonth > agent.monthlyLimit) {
        throw new ApiError("MONTHLY_LIMIT_EXCEEDED", 422, `Agent monthly limit (${agent.monthlyLimit}) would be exceeded.`);
      }
    }

    // Tenant rules are applied to the transaction by CCP.
    const rules = (await db.rule.findMany({ where: { ownerId: user.id } })).map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      action: r.action,
      enabled: r.enabled,
      conditions: (r.conditions ?? {}) as Record<string, unknown>,
    }));

    const validation = await validateTransaction(
      { sender, receiver, amount, assetType, reference: reference ?? undefined, agentId, dailyLimit },
      rules,
    );

    const status = !validation.approved
      ? "BLOCKED"
      : validation.riskScore >= 60
        ? "APPROVED"
        : "EXECUTED";

    const transaction = await db.transaction.create({
      data: {
        sender,
        receiver,
        amount,
        assetType,
        riskScore: validation.riskScore,
        riskLevel: riskScoreToLevel(validation.riskScore),
        status,
        type: type as "PAYMENT" | "PAYROLL" | "SUPPLIER" | "ESCROW" | "TREASURY",
        reference,
        agentId,
        metadata: { decisions: validation.decisions, auditHash: validation.auditHash } as unknown as Prisma.InputJsonValue,
      },
      include: { agent: { select: { name: true } } },
    });

    if (agentId) {
      await db.agent.update({ where: { id: agentId }, data: { lastUsedAt: new Date() } });
    }

    await writeAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: status === "BLOCKED" ? "TRANSACTION_BLOCKED" : "TRANSACTION_CREATE",
      resourceType: "transaction",
      resourceId: transaction.id,
      transactionId: transaction.id,
      metadata: {
        sender,
        receiver,
        amount,
        assetType,
        riskScore: validation.riskScore,
        decisions: validation.decisions.map((d) => ({ rule: d.ruleName, result: d.result })),
        auditHash: validation.auditHash ?? generateAuditHash("create", { id: transaction.id }),
      },
      ipAddress,
    });

    return ok({
      transaction: toTransactionDto(transaction),
      validation: {
        approved: validation.approved,
        riskScore: validation.riskScore,
        riskLevel: validation.riskLevel,
        flags: validation.flags,
        decisions: validation.decisions,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[transaction/create]", error);
    return fail("Failed to create transaction", 500, "INTERNAL");
  }
}
