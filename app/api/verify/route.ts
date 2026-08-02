import { db } from "@/lib/database/client";
import { fail, ok, readJson, requireApiUser, ApiError } from "@/lib/api";
import { verifyIdentity } from "@/lib/cleanverse";
import { writeAuditLog } from "@/lib/database/audit";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await readJson(request);
    const walletAddress =
      typeof body.walletAddress === "string" ? body.walletAddress.trim().toLowerCase() : user.walletAddress;

    const status = await verifyIdentity({
      walletAddress,
      name: user.name ?? undefined,
      email: user.email ?? undefined,
    });

    const existing = await db.verification.findFirst({
      where: { userId: user.id, type: "IDENTITY", provider: "CVI" },
    });

    if (existing) {
      await db.verification.update({
        where: { id: existing.id },
        data: {
          status: status.verified ? "VERIFIED" : "REJECTED",
          reference: status.reference,
          verifiedAt: status.verified ? new Date() : null,
        },
      });
    } else {
      await db.verification.create({
        data: {
          userId: user.id,
          type: "IDENTITY",
          provider: "CVI",
          status: status.verified ? "VERIFIED" : "REJECTED",
          reference: status.reference,
          verifiedAt: status.verified ? new Date() : null,
        },
      });
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        verified: status.verified,
        verificationStatus: status.verified ? "VERIFIED" : "PENDING",
        kycLevel: status.level,
      },
    });

    await writeAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: "IDENTITY_VERIFY",
      resourceType: "user",
      resourceId: user.id,
      metadata: { reference: status.reference, level: status.level, checks: status.checkCount },
      ipAddress: request.headers.get("x-forwarded-for") ?? "local",
    });

    return ok({
      status,
      user: {
        verified: status.verified,
        verificationStatus: status.verified ? "VERIFIED" : "PENDING",
        kycLevel: status.level,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[verify]", error);
    return fail("Identity verification failed", 500, "INTERNAL");
  }
}
