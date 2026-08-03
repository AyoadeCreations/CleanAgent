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
  const settlements = executed.length;
  const pendingCount = transactions.filter((t) => t.status === "PENDING").length;
  const blockedCount = transactions.filter((t) => t.status === "BLOCKED").length;

  const verifiedUsers = await db.user.count({ where: { verified: true } });
  const isOverseer = user.role === "COMPLIANCE" || user.role === "ADMIN";
  const activeAgents = isOverseer
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

  // --- Trends (last 7 days vs previous 7 days) -----------------------------
  const now = new Date();
  const startLast = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  const startPrev = new Date(now.getTime() - 14 * 24 * 3600 * 1000);

  const settled = (t: (typeof transactions)[number]) => t.status === "EXECUTED" || t.status === "APPROVED";

  const last7 = transactions.filter((t) => t.createdAt >= startLast);
  const prev7 = transactions.filter((t) => t.createdAt >= startPrev && t.createdAt < startLast);

  const last7Settled = last7.filter(settled);
  const prev7Settled = prev7.filter(settled);
  const last7Volume = last7Settled.reduce((s, t) => s + t.amount, 0);
  const prev7Volume = prev7Settled.reduce((s, t) => s + t.amount, 0);

  const pct = (cur: number, prev: number) => {
    if (prev === 0) return cur === 0 ? 0 : 100;
    return Math.round(((cur - prev) / prev) * 100);
  };

  const [agentsLast, agentsPrev] = await Promise.all([
    db.agent.count({ where: { createdAt: { gte: startLast } } }),
    db.agent.count({ where: { createdAt: { gte: startPrev, lt: startLast } } }),
  ]);
  const [verifiedLast, verifiedPrev] = await Promise.all([
    db.user.count({ where: { verified: true, createdAt: { gte: startLast } } }),
    db.user.count({ where: { verified: true, createdAt: { gte: startPrev, lt: startLast } } }),
  ]);

  const last7Score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 - (last7.length ? (last7.filter((t) => t.status === "BLOCKED").length / last7.length) * 60 : 0) - (last7.length ? last7.reduce((s, t) => s + t.riskScore, 0) / last7.length : 0) / 2,
      ),
    ),
  );
  const prev7Score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 - (prev7.length ? (prev7.filter((t) => t.status === "BLOCKED").length / prev7.length) * 60 : 0) - (prev7.length ? prev7.reduce((s, t) => s + t.riskScore, 0) / prev7.length : 0) / 2,
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

  const activityByDay: DashboardSummary["activityByDay"] = days.map((d) => ({
    date: d.date,
    settlementCount: 0,
    blockedCount: 0,
    avgRisk: 0,
  }));
  const activityIndex = new Map(activityByDay.map((a, i) => [a.date, i]));
  for (const t of transactions) {
    const i = activityIndex.get(t.createdAt.toISOString().slice(0, 10));
    if (i === undefined) continue;
    if (settled(t)) activityByDay[i].settlementCount += 1;
    if (t.status === "BLOCKED") activityByDay[i].blockedCount += 1;
  }
  for (const a of activityByDay) {
    const dayTx = transactions.filter((t) => t.createdAt.toISOString().slice(0, 10) === a.date);
    a.avgRisk = dayTx.length
      ? Math.round(dayTx.reduce((s, t) => s + t.riskScore, 0) / dayTx.length)
      : 0;
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
      settlements,
    },
    trends: {
      volumePercent: pct(last7Volume, prev7Volume),
      transactionsPercent: pct(last7.length, prev7.length),
      settlementsPercent: pct(last7Settled.length, prev7Settled.length),
      agentsPercent: pct(agentsLast, agentsPrev),
      verifiedPercent: pct(verifiedLast, verifiedPrev),
      complianceDelta: last7Score - prev7Score,
    },
    volumeByType,
    volumeByDay: days,
    activityByDay,
    riskDistribution,
  };
}
