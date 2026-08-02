import { db } from "@/lib/database/client";
import { getSessionUser } from "@/lib/auth/session";
import { ok } from "@/lib/api";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return ok({ user: null });
  }
  const full = await db.user.findUnique({ where: { id: user.id } });
  if (!full) {
    return ok({ user: null });
  }
  return ok({
    user: {
      id: full.id,
      walletAddress: full.walletAddress,
      email: full.email,
      name: full.name,
      role: full.role,
      verified: full.verified,
      kycLevel: full.kycLevel,
      verificationStatus: full.verificationStatus,
      createdAt: full.createdAt.toISOString(),
    },
  });
}
