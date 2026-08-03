import { db } from "@/lib/database/client";

export type ReportEntry = {
  transactionId: string;
  reference: string | null;
  sender: string;
  receiver: string;
  amount: number;
  assetType: string;
  type: string;
  timestamp: string;
  riskScore: number;
  riskLevel: string;
  status: string;
  validation: string;
};

export type PublicReport = {
  id: string;
  reportHash: string;
  type: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  totalVolume: number;
  transactions: number;
  flags: number;
  suspensions: number;
  blocked: number;
  generatedBy: string;
  entries: ReportEntry[];
};

export async function getPublicReport(): Promise<PublicReport | null> {
  const latest = await db.report.findFirst({
    orderBy: { createdAt: "desc" },
    take: 1,
  });
  if (!latest) return null;

  const data = (latest.data ?? {}) as Record<string, unknown>;
  const entries = Array.isArray(data.entries) ? (data.entries as ReportEntry[]) : [];
  const periodStart = latest.periodStart?.toISOString() ?? latest.createdAt.toISOString();
  const periodEnd = latest.periodEnd?.toISOString() ?? latest.createdAt.toISOString();

  return {
    id: latest.id,
    reportHash: latest.reportHash,
    type: latest.type,
    periodStart,
    periodEnd,
    createdAt: latest.createdAt.toISOString(),
    totalVolume: Number(data.totalVolume ?? 0),
    transactions: Number(data.transactions ?? 0),
    flags: Number(data.flags ?? 0),
    suspensions: Number(data.suspensions ?? 0),
    blocked: Number(data.blocked ?? 0),
    generatedBy: typeof data.generatedBy === "string" ? data.generatedBy : "",
    entries,
  };
}

export async function getPublicReportHistory(): Promise<Array<{ id: string; reportHash: string; createdAt: string }>> {
  const history = await db.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, reportHash: true, createdAt: true },
  });
  return history.map((r) => ({
    id: r.id,
    reportHash: r.reportHash,
    createdAt: r.createdAt.toISOString(),
  }));
}
