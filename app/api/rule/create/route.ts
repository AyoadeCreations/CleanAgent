import { db } from "@/lib/database/client";
import { fail, ok, readJson, requireApiUser, ApiError } from "@/lib/api";
import { writeAuditLog } from "@/lib/database/audit";
import { z } from "zod";
import { parseOrThrow } from "@/lib/validation";

const ruleCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(400).optional().or(z.literal("")),
  type: z.enum(["ALLOWLIST", "BLOCKLIST", "MAX_AMOUNT", "RISK_THRESHOLD", "SPEND_LIMIT", "TIME_WINDOW"]),
  action: z.enum(["ALLOW", "BLOCK", "FLAG"]).default("ALLOW"),
  priority: z.number().int().nonnegative().max(100).optional(),
  enabled: z.boolean().optional(),
  conditions: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await readJson(request);
    const input = parseOrThrow(ruleCreateSchema, body);
    const name = input.name;
    const description = input.description?.trim() ? input.description.trim() : null;
    const type = input.type;
    const action = input.action;
    const priority = input.priority ?? 0;
    const enabled = input.enabled !== false;
    const conditions = (input.conditions ?? {}) as Record<string, unknown>;

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
