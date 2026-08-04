import { NextRequest } from "next/server";
import { db } from "@/lib/database/client";
import { fail, ok, readJson, requireApiUser, ApiError } from "@/lib/api";
import { writeAuditLog } from "@/lib/database/audit";
import { parseOrThrow, agentUpdateSchema } from "@/lib/validation";
import type { AgentStatus } from "@/lib/types";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const body = await readJson(request);

    const agent = await db.agent.findUnique({ where: { id } });
    if (!agent) throw new ApiError("NOT_FOUND", 404, "Agent not found.");
    if (agent.ownerId !== user.id) throw new ApiError("FORBIDDEN", 403, "You do not own this agent.");

    const input = parseOrThrow(agentUpdateSchema, {
      name: body.name,
      description: body.description,
      dailyLimit: body.dailyLimit,
      monthlyLimit: body.monthlyLimit,
      status: body.status,
    });

    const data: {
      name?: string;
      description?: string | null;
      dailyLimit?: number;
      monthlyLimit?: number;
      permissions?: object;
      status?: AgentStatus;
    } = {};

    if (input.name) data.name = input.name.trim();
    if (typeof input.description === "string") data.description = input.description.trim();
    if (typeof input.dailyLimit === "number") data.dailyLimit = input.dailyLimit;
    if (typeof input.monthlyLimit === "number") data.monthlyLimit = input.monthlyLimit;
    if (body.permissions && typeof body.permissions === "object") data.permissions = body.permissions as object;
    if (input.status) data.status = input.status;

    const updated = await db.agent.update({ where: { id }, data });

    await writeAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: "AGENT_UPDATE",
      resourceType: "agent",
      resourceId: id,
      metadata: data,
      ipAddress: request.headers.get("x-forwarded-for") ?? "local",
    });

    return ok({
      agent: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        dailyLimit: updated.dailyLimit,
        monthlyLimit: updated.monthlyLimit,
        permissions: updated.permissions,
        status: updated.status,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[agent/update]", error);
    return fail("Failed to update agent", 500, "INTERNAL");
  }
}
