import { db } from "@/lib/database/client";
import { fail, ok, requireApiUser, ApiError } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireApiUser();
    if (user.role !== "COMPLIANCE" && user.role !== "ADMIN") {
      throw new ApiError("FORBIDDEN", 403, "Audit logs are restricted to compliance officers.");
    }

    const logs = await db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { name: true, email: true, walletAddress: true } } },
    });

    return ok({
      logs: logs.map((l) => ({
        id: l.id,
        action: l.action,
        resourceType: l.resourceType,
        resourceId: l.resourceId,
        actorRole: l.actorRole,
        actorName: l.user?.name ?? l.user?.email ?? null,
        actorAddress: l.user?.walletAddress ?? null,
        metadata: l.metadata,
        ipAddress: l.ipAddress,
        createdAt: l.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[audit]", error);
    return fail("Failed to load audit logs", 500, "INTERNAL");
  }
}
