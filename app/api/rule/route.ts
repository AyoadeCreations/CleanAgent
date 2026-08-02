import { db } from "@/lib/database/client";
import { fail, ok, requireApiUser, ApiError } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireApiUser();
    const rules = await db.rule.findMany({
      where: { ownerId: user.id },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });
    return ok({
      rules: rules.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        type: r.type,
        conditions: r.conditions,
        action: r.action,
        priority: r.priority,
        enabled: r.enabled,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[rule]", error);
    return fail("Failed to load rules", 500, "INTERNAL");
  }
}
