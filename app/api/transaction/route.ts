import { db } from "@/lib/database/client";
import { fail, ok, requireApiUser, ApiError } from "@/lib/api";
import { toTransactionDto } from "@/lib/database/mappers";

export async function GET() {
  try {
    const user = await requireApiUser();

    const isOverseer = user.role === "COMPLIANCE" || user.role === "ADMIN";
    let where: Record<string, unknown> = {};

    if (!isOverseer) {
      const agentWallets =
        user.role === "BUSINESS"
          ? (await db.agent.findMany({ where: { ownerId: user.id } })).map((a) => a.walletAddress).filter(Boolean)
          : [];
      const wallets = [user.walletAddress, ...agentWallets];
      where = {
        OR: [{ sender: { in: wallets } }, { receiver: user.walletAddress }],
      };
    }

    const transactions = await db.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { agent: { select: { name: true } } },
    });

    return ok({ transactions: transactions.map(toTransactionDto) });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[transaction]", error);
    return fail("Failed to load transactions", 500, "INTERNAL");
  }
}
