import { db } from "@/lib/database/client";
import { fail, ok, requireApiUser, readJson, ApiError } from "@/lib/api";
import { writeAuditLog } from "@/lib/database/audit";
import { parseOrThrow, businessCreateSchema } from "@/lib/validation";

export async function GET() {
  try {
    const user = await requireApiUser();
    const business = await db.business.findFirst({ where: { ownerId: user.id } });
    if (!business) {
      return ok({ business: null });
    }
    const agentCount = await db.agent.count({ where: { ownerId: user.id } });
    const ruleCount = await db.rule.count({ where: { ownerId: user.id } });
    return ok({
      business: {
        id: business.id,
        name: business.name,
        description: business.description,
        status: business.status,
        agentCount,
        ruleCount,
        createdAt: business.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[business]", error);
    return fail("Failed to load business", 500, "INTERNAL");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    if (user.role !== "BUSINESS") {
      throw new ApiError("NOT_ALLOWED", 403, "Only business accounts can create a business.");
    }
    const body = await readJson(request);
    const { name, description } = parseOrThrow(businessCreateSchema, body);
    if (!name) throw new ApiError("MISSING_NAME", 400, "Business name is required.");

    const existing = await db.business.findFirst({ where: { ownerId: user.id } });
    if (existing) throw new ApiError("ALREADY_EXISTS", 409, "Business profile already exists.");

    const business = await db.business.create({
      data: { ownerId: user.id, name, description },
    });

    await writeAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: "BUSINESS_CREATE",
      resourceType: "business",
      resourceId: business.id,
      metadata: { name },
      ipAddress: request.headers.get("x-forwarded-for") ?? "local",
    });

    return ok({
      business: {
        id: business.id,
        name: business.name,
        description: business.description,
        status: business.status,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[business]", error);
    return fail("Failed to create business", 500, "INTERNAL");
  }
}
