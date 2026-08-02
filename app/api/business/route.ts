import { db } from "@/lib/database/client";
import { fail, ok, requireApiUser, ApiError } from "@/lib/api";

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
