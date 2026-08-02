import { db } from "@/lib/database/client";
import { fail, ok, readJson, requireApiUser, ApiError } from "@/lib/api";
import { verifyAsset } from "@/lib/cleanverse";
import { writeAuditLog } from "@/lib/database/audit";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await readJson(request);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const symbol = typeof body.symbol === "string" ? body.symbol.trim().toUpperCase() : null;
    const assetType = typeof body.assetType === "string" ? body.assetType : "TOKEN";
    const contractAddress = typeof body.contractAddress === "string" ? body.contractAddress.trim() : null;

    if (!name) throw new ApiError("MISSING_NAME", 400, "Asset name is required.");
    if (contractAddress && !/^0x[0-9a-fA-F]{40}$/.test(contractAddress)) {
      throw new ApiError("INVALID_ADDRESS", 400, "Contract address must be a valid EVM address.");
    }

    const status = await verifyAsset({
      name,
      symbol: symbol ?? undefined,
      assetType,
      contractAddress: contractAddress ?? undefined,
      owner: user.walletAddress,
    });

    const asset = await db.asset.create({
      data: {
        ownerId: user.id,
        name,
        symbol,
        assetType: assetType as "TOKEN" | "NFT" | "RECEIVABLE" | "POINT",
        contractAddress,
        chain: "monad-testnet",
        riskScore: status.riskScore,
        verified: status.verified,
        metadata: { reference: status.reference },
      },
    });

    await db.verification.create({
      data: {
        userId: user.id,
        type: "ASSET",
        provider: "CVA",
        status: status.verified ? "VERIFIED" : "REJECTED",
        reference: status.reference,
        metadata: { assetId: asset.id, assetName: name },
        verifiedAt: status.verified ? new Date() : null,
      },
    });

    await writeAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: "ASSET_VERIFY",
      resourceType: "asset",
      resourceId: asset.id,
      metadata: { reference: status.reference, riskScore: status.riskScore },
      ipAddress: request.headers.get("x-forwarded-for") ?? "local",
    });

    return ok({
      asset: {
        id: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        assetType: asset.assetType,
        contractAddress: asset.contractAddress,
        riskScore: asset.riskScore,
        verified: asset.verified,
        reference: status.reference,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[verify/asset]", error);
    return fail("Asset verification failed", 500, "INTERNAL");
  }
}
