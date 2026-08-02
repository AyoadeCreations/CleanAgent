import { db } from "@/lib/database/client";
import { fail, ok, requireApiUser, ApiError } from "@/lib/api";
import { generateAuditHash } from "@/lib/cleanverse";
import { getScopedTransactionWhere } from "@/lib/database/summary";

export async function GET() {
  try {
    const user = await requireApiUser();
    const where = await getScopedTransactionWhere(user);
    const transactions = await db.transaction.findMany({ where });

    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 30);

    const scoped = transactions.filter((t) => t.createdAt >= periodStart);
    const totalVolume = scoped.filter((t) => t.status === "EXECUTED" || t.status === "APPROVED").reduce((s, t) => s + t.amount, 0);
    const flags = scoped.filter((t) => t.riskScore >= 50).length;
    const suspensions = scoped.filter((t) => t.status === "SUSPENDED").length;
    const blocked = scoped.filter((t) => t.status === "BLOCKED").length;

    const reportData = {
      periodStart: periodStart.toISOString(),
      periodEnd: new Date().toISOString(),
      totalVolume,
      transactions: scoped.length,
      flags,
      suspensions,
      blocked,
      generatedBy: user.id,
    };

    const reportHash = generateAuditHash("report", reportData);

    const report = await db.report.create({
      data: {
        userId: user.id,
        reportHash,
        type: "COMPLIANCE",
        periodStart,
        periodEnd: new Date(),
        data: reportData as object,
      },
    });

    const history = await db.report.findMany({
      where: user.role === "COMPLIANCE" || user.role === "ADMIN" ? {} : { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return ok({
      report: {
        id: report.id,
        reportHash,
        type: report.type,
        periodStart: reportData.periodStart,
        periodEnd: reportData.periodEnd,
        data: reportData,
        createdAt: report.createdAt.toISOString(),
      },
      history: history.map((r) => ({
        id: r.id,
        reportHash: r.reportHash,
        type: r.type,
        createdAt: r.createdAt.toISOString(),
        data: r.data,
      })),
    });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[report]", error);
    return fail("Failed to generate report", 500, "INTERNAL");
  }
}
