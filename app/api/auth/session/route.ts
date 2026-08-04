import { db } from "@/lib/database/client";
import { createSession, destroySession, toSessionUser } from "@/lib/auth/session";
import { requireWalletProof } from "@/lib/auth/nonce";
import { verifyPassword } from "@/lib/auth/password";
import { fail, ok, readJson, ApiError } from "@/lib/api";
import { writeAuditLog } from "@/lib/database/audit";
import { parseOrThrow, loginEmailSchema, walletLoginSchema } from "@/lib/validation";
import type { SessionUser } from "@/lib/types";

const WALLET_RE = /^0x[0-9a-fA-F]{40}$/;

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
    const password = typeof body.password === "string" ? body.password : undefined;
    const walletAddress = typeof body.walletAddress === "string" ? body.walletAddress.trim().toLowerCase() : undefined;
    const nonce = typeof body.nonce === "string" ? body.nonce : undefined;
    const signature = typeof body.signature === "string" ? body.signature : undefined;
    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    const autoRegister = body.autoRegister === true;
    const ipAddress = request.headers.get("x-forwarded-for") ?? "local";

    let user: SessionUser | null = null;

    if (email) {
      const { email: validEmail, password: validPassword } = parseOrThrow(loginEmailSchema, { email, password });
      const found = await db.user.findFirst({ where: { email: validEmail } });
      if (!found || !found.passwordHash || !verifyPassword(validPassword, found.passwordHash)) {
        throw new ApiError("INVALID_CREDENTIALS", 401, "Invalid email or password.");
      }
      user = toSessionUser(found);
    } else if (walletAddress) {
      if (!WALLET_RE.test(walletAddress)) {
        throw new ApiError("INVALID_WALLET", 400, "Wallet address must be a valid EVM address.");
      }
      const proof = parseOrThrow(walletLoginSchema, { walletAddress, nonce, signature });
      await requireWalletProof(proof.walletAddress, proof.nonce, proof.signature);

      let found = await db.user.findUnique({ where: { walletAddress: proof.walletAddress } });
      if (!found && autoRegister) {
        found = await db.user.create({
          data: { walletAddress: proof.walletAddress, name: name ?? null, role: "MERCHANT" },
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
      throw new ApiError("MISSING_CREDENTIALS", 400, "Provide an email and password, or a wallet signature.");
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
