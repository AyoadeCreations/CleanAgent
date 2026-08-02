import { db } from "@/lib/database/client";
import { fail, ok, requireApiUser, ApiError } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireApiUser();
    const agents = await db.agent.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { transactions: true } } },
    });

    return ok({
      agents: agents.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        businessId: a.businessId,
        walletAddress: a.walletAddress,
        dailyLimit: a.dailyLimit,
        monthlyLimit: a.monthlyLimit,
        permissions: a.permissions,
        status: a.status,
        lastUsedAt: a.lastUsedAt?.toISOString() ?? null,
        createdAt: a.createdAt.toISOString(),
        transactionCount: a._count.transactions,
      })),
    });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[agent]", error);
    return fail("Failed to load agents", 500, "INTERNAL");
  }
}
