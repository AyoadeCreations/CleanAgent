import { db } from "@/lib/database/client";
import type { SessionUser, DashboardSummary, TransactionType, RiskLevel } from "@/lib/types";

export async function getScopedTransactionWhere(user: SessionUser): Promise<Record<string, unknown>> {
  const isOverseer = user.role === "COMPLIANCE" || user.role === "ADMIN";
  if (isOverseer) return {};

  const agentWallets =
    user.role === "BUSINESS"
      ? (await db.agent.findMany({ where: { ownerId: user.id } })).map((a) => a.walletAddress).filter(Boolean)
      : [];

  const wallets = [user.walletAddress, ...agentWallets];
  return { OR: [{ sender: { in: wallets } }, { receiver: user.walletAddress }] };
}

export async function buildDashboardSummary(user: SessionUser): Promise<DashboardSummary> {
  const where = await getScopedTransactionWhere(user);
  const transactions = await db.transaction.findMany({ where });

  const executed = transactions.filter((t) => t.status === "EXECUTED" || t.status === "APPROVED");
  const totalVolume = executed.reduce((s, t) => s + t.amount, 0);
  const pendingCount = transactions.filter((t) => t.status === "PENDING").length;
  const blockedCount = transactions.filter((t) => t.status === "BLOCKED").length;

  const verifiedUsers = await db.user.count({ where: { verified: true } });
  const activeAgents =
    user.role === "COMPLIANCE" || user.role === "ADMIN"
      ? await db.agent.count({ where: { status: "ACTIVE" } })
      : await db.agent.count({ where: { ownerId: user.id, status: "ACTIVE" } });

  const avgRisk = transactions.length
    ? transactions.reduce((s, t) => s + t.riskScore, 0) / transactions.length
    : 0;
  const complianceScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 - (transactions.length ? (blockedCount / transactions.length) * 60 : 0) - avgRisk / 2,
      ),
    ),
  );

  const typeMap = new Map<string, { volume: number; count: number }>();
  for (const t of transactions) {
    const cur = typeMap.get(t.type) ?? { volume: 0, count: 0 };
    cur.volume += t.amount;
    cur.count += 1;
    typeMap.set(t.type, cur);
  }
  const volumeByType = Array.from(typeMap.entries()).map(([type, v]) => ({
    type: type as TransactionType,
    volume: v.volume,
    count: v.count,
  }));

  const now = new Date();
  const days: DashboardSummary["volumeByDay"] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    days.push({ date: d.toISOString().slice(0, 10), volume: 0, count: 0 });
  }
  const dayIndex = new Map(days.map((d, i) => [d.date, i]));
  for (const t of transactions) {
    const key = t.createdAt.toISOString().slice(0, 10);
    const i = dayIndex.get(key);
    if (i !== undefined) {
      days[i].volume += t.amount;
      days[i].count += 1;
    }
  }

  const riskMap = new Map<string, number>();
  for (const t of transactions) riskMap.set(t.riskLevel, (riskMap.get(t.riskLevel) ?? 0) + 1);
  const riskDistribution = Array.from(riskMap.entries()).map(([riskLevel, count]) => ({
    riskLevel: riskLevel as RiskLevel,
    count,
  }));

  return {
    overview: {
      totalVolume,
      verifiedUsers,
      activeAgents,
      complianceScore,
      transactionCount: transactions.length,
      pendingCount,
      blockedCount,
    },
    volumeByType,
    volumeByDay: days,
    riskDistribution,
  };
}
