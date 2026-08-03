import { db } from "@/lib/database/client";
import { fail, ok, requireApiUser, ApiError } from "@/lib/api";
import { generateComplianceReport } from "@/lib/cleanverse";
import { getScopedTransactionWhere } from "@/lib/database/summary";
import type { SessionUser } from "@/lib/types";

async function generateReport(user: SessionUser) {
  const where = await getScopedTransactionWhere(user);
  const transactions = await db.transaction.findMany({ where });

  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - 30);

  const scoped = transactions.filter((t) => t.createdAt >= periodStart);
  const { data, reportHash } = generateComplianceReport({
    userId: user.id,
    periodStart,
    periodEnd: new Date(),
    transactions: scoped.map((t) => ({
      id: t.id,
      reference: t.reference,
      sender: t.sender,
      receiver: t.receiver,
      amount: t.amount,
      assetType: t.assetType,
      type: t.type,
      createdAt: t.createdAt,
      riskScore: t.riskScore,
      riskLevel: t.riskLevel,
      status: t.status,
    })),
  });

  const report = await db.report.create({
    data: {
      userId: user.id,
      reportHash,
      type: "COMPLIANCE",
      periodStart,
      periodEnd: new Date(),
      data: data as object,
    },
  });

  return {
    id: report.id,
    reportHash,
    type: report.type,
    periodStart: data.periodStart,
    periodEnd: data.periodEnd,
    data,
    createdAt: report.createdAt.toISOString(),
  };
}

async function reportHistory(user: SessionUser) {
  const history = await db.report.findMany({
    where: user.role === "COMPLIANCE" || user.role === "ADMIN" ? {} : { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return history.map((r) => ({
    id: r.id,
    reportHash: r.reportHash,
    type: r.type,
    createdAt: r.createdAt.toISOString(),
    data: r.data,
  }));
}

export async function GET() {
  try {
    const user = await requireApiUser();
    const report = await generateReport(user);
    const history = await reportHistory(user);
    return ok({ report, history });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[report]", error);
    return fail("Failed to load reports", 500, "INTERNAL");
  }
}

export async function POST() {
  try {
    const user = await requireApiUser();
    const report = await generateReport(user);
    const history = await reportHistory(user);
    return ok({ report, history });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[report]", error);
    return fail("Failed to generate report", 500, "INTERNAL");
  }
}
