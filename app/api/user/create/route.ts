import { db } from "@/lib/database/client";
import { fail, ok, readJson, ApiError } from "@/lib/api";
import { writeAuditLog } from "@/lib/database/audit";

const WALLET_RE = /^0x[0-9a-fA-F]{40}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const walletAddress = typeof body.walletAddress === "string" ? body.walletAddress.trim().toLowerCase() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : null;
    const name = typeof body.name === "string" ? body.name.trim() : null;
    const role = body.role === "BUSINESS" ? "BUSINESS" : "MERCHANT";
    const ipAddress = request.headers.get("x-forwarded-for") ?? "local";

    if (!WALLET_RE.test(walletAddress)) {
      throw new ApiError("INVALID_WALLET", 400, "Wallet address must be a valid EVM address (0x + 40 hex chars).");
    }
    if (email && !EMAIL_RE.test(email)) {
      throw new ApiError("INVALID_EMAIL", 400, "Enter a valid email address.");
    }
    if (email && (await db.user.findFirst({ where: { email } }))) {
      throw new ApiError("EMAIL_TAKEN", 409, "An account with this email already exists.");
    }
    if (await db.user.findUnique({ where: { walletAddress } })) {
      throw new ApiError("WALLET_TAKEN", 409, "An account with this wallet already exists.");
    }

    const user = await db.user.create({
      data: { walletAddress, email, name, role },
    });

    await writeAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: "USER_CREATE",
      resourceType: "user",
      resourceId: user.id,
      ipAddress,
    });

    return ok({
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified,
        kycLevel: user.kycLevel,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[user/create]", error);
    return fail("Failed to create account", 500, "INTERNAL");
  }
}
