import { db } from "@/lib/database/client";
import { fail, ok, readJson, requireApiUser, ApiError } from "@/lib/api";
import { writeAuditLog } from "@/lib/database/audit";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await readJson(request);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : null;
    const type = typeof body.type === "string" ? body.type : "";
    const action = typeof body.action === "string" ? body.action.toUpperCase() : "ALLOW";
    const priority = typeof body.priority === "number" ? body.priority : 0;
    const enabled = body.enabled !== false;
    const conditions = (body.conditions as Record<string, unknown>) ?? {};

    if (!name) throw new ApiError("MISSING_NAME", 400, "Rule name is required.");
    if (!type) throw new ApiError("MISSING_TYPE", 400, "Rule type is required.");
    if (!["ALLOW", "BLOCK", "FLAG"].includes(action)) {
      throw new ApiError("INVALID_ACTION", 400, "Rule action must be ALLOW, BLOCK or FLAG.");
    }

    const ownedBusiness = user.role === "BUSINESS"
      ? await db.business.findFirst({ where: { ownerId: user.id } })
      : null;

    const rule = await db.rule.create({
      data: {
        ownerId: user.id,
        businessId: ownedBusiness?.id ?? null,
        name,
        description,
        type,
        conditions: conditions as object,
        action,
        priority,
        enabled,
      },
    });

    await writeAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: "RULE_CREATE",
      resourceType: "rule",
      resourceId: rule.id,
      metadata: { name, type, action, priority },
      ipAddress: request.headers.get("x-forwarded-for") ?? "local",
    });

    return ok({
      rule: {
        id: rule.id,
        name: rule.name,
        description: rule.description,
        type: rule.type,
        conditions: rule.conditions,
        action: rule.action,
        priority: rule.priority,
        enabled: rule.enabled,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[rule/create]", error);
    return fail("Failed to create rule", 500, "INTERNAL");
  }
}
