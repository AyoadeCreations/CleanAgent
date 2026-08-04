import { db } from "@/lib/database/client";
import { fail, ok, readJson, requireApiUser, ApiError } from "@/lib/api";
import { writeAuditLog } from "@/lib/database/audit";
import { parseOrThrow, agentCreateSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await readJson(request);
    const input = parseOrThrow(agentCreateSchema, body);
    const name = input.name;
    const description = input.description?.trim() ? input.description.trim() : null;
    const dailyLimit = input.dailyLimit;
    const monthlyLimit = input.monthlyLimit;
    const permissions = (body.permissions as Record<string, unknown>) ?? {};
    const walletAddress = input.walletAddress?.trim().toLowerCase() || null;

    if (!name) throw new ApiError("MISSING_NAME", 400, "Agent name is required.");
    if (dailyLimit < 0 || monthlyLimit < 0) throw new ApiError("INVALID_LIMITS", 400, "Limits cannot be negative.");
    if (walletAddress && !/^0x[0-9a-fA-F]{40}$/.test(walletAddress)) {
      throw new ApiError("INVALID_WALLET", 400, "Agent wallet must be a valid EVM address.");
    }

    const ownedBusiness = user.role === "BUSINESS"
      ? await db.business.findFirst({ where: { ownerId: user.id } })
      : null;

    const agent = await db.agent.create({
      data: {
        ownerId: user.id,
        businessId: ownedBusiness?.id ?? null,
        name,
        description,
        walletAddress,
        dailyLimit,
        monthlyLimit,
        permissions: permissions as object,
        status: "ACTIVE",
      },
    });

    await writeAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: "AGENT_CREATE",
      resourceType: "agent",
      resourceId: agent.id,
      metadata: { name: agent.name, dailyLimit, monthlyLimit },
      ipAddress: request.headers.get("x-forwarded-for") ?? "local",
    });

    return ok({
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        businessId: agent.businessId,
        dailyLimit: agent.dailyLimit,
        monthlyLimit: agent.monthlyLimit,
        permissions: agent.permissions,
        status: agent.status,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[agent/create]", error);
    return fail("Failed to create agent", 500, "INTERNAL");
  }
}
