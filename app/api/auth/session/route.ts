import { db } from "@/lib/database/client";
import { createSession, destroySession } from "@/lib/auth/session";
import { toSessionUser } from "@/lib/auth/session";
import { fail, ok, readJson, ApiError } from "@/lib/api";
import { writeAuditLog } from "@/lib/database/audit";
import type { SessionUser } from "@/lib/types";

function toUserDto(user: SessionUser) {
  return {
    id: user.id,
    walletAddress: user.walletAddress,
    email: user.email,
    name: user.name,
    role: user.role,
    verified: user.verified,
    kycLevel: user.kycLevel,
  };
}

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
    const walletAddress = typeof body.walletAddress === "string" ? body.walletAddress.trim().toLowerCase() : undefined;
    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    const autoRegister = body.autoRegister === true;
    const ipAddress = request.headers.get("x-forwarded-for") ?? "local";

    let user: SessionUser | null = null;

    if (email) {
      const found = await db.user.findFirst({ where: { email } });
      if (!found) throw new ApiError("INVALID_CREDENTIALS", 401, "No account found for this email.");
      user = toSessionUser(found);
    } else if (walletAddress) {
      if (!/^0x[0-9a-f]{40}$/.test(walletAddress)) {
        throw new ApiError("INVALID_WALLET", 400, "Wallet address must be a valid EVM address.");
      }
      let found = await db.user.findUnique({ where: { walletAddress } });
      if (!found && autoRegister) {
        found = await db.user.create({
          data: { walletAddress, name: name ?? null, role: "MERCHANT" },
        });
        await writeAuditLog({
          actorId: found.id,
          actorRole: found.role,
          action: "USER_CREATE",
          resourceType: "user",
          resourceId: found.id,
          ipAddress,
        });
      }
      if (!found) throw new ApiError("NOT_REGISTERED", 404, "Wallet not registered. Create an account first.");
      user = toSessionUser(found);
    } else {
      throw new ApiError("MISSING_CREDENTIALS", 400, "Provide an email or wallet address.");
    }

    await createSession(user);
    await writeAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: "AUTH_LOGIN",
      resourceType: "session",
      resourceId: user.id,
      ipAddress,
    });

    return ok({ user: toUserDto(user) });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[auth/session]", error);
    return fail("Login failed", 500, "INTERNAL");
  }
}

export async function DELETE() {
  await destroySession();
  return ok({ signedOut: true });
}
