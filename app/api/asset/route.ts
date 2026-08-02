import { db } from "@/lib/database/client";
import { fail, ok, requireApiUser, ApiError } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireApiUser();
    const assets = await db.asset.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return ok({
      assets: assets.map((a) => ({
        id: a.id,
        name: a.name,
        symbol: a.symbol,
        assetType: a.assetType,
        contractAddress: a.contractAddress,
        chain: a.chain,
        riskScore: a.riskScore,
        verified: a.verified,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[asset]", error);
    return fail("Failed to load assets", 500, "INTERNAL");
  }
}
