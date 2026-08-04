import { NextRequest } from "next/server";
import { db } from "@/lib/database/client";
import { fail, ok, readJson, requireApiUser, ApiError } from "@/lib/api";
import { writeAuditLog } from "@/lib/database/audit";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const report = await db.report.findUnique({ where: { id } });
    if (!report) throw new ApiError("NOT_FOUND", 404, "Report not found.");

    const isOverseer = user.role === "COMPLIANCE" || user.role === "ADMIN";
    const isOwner = report.userId === user.id;
    if (!isOverseer && !isOwner) {
      throw new ApiError("FORBIDDEN", 403, "You cannot update this report.");
    }

    const body = await readJson(request);
    const type = typeof body.type === "string" && body.type.trim() ? body.type.trim().toUpperCase() : report.type;

    const updated = await db.report.update({
      where: { id },
      data: { type },
    });

    await writeAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: "REPORT_UPDATE",
      resourceType: "report",
      resourceId: id,
      metadata: { from: report.type, to: type },
      ipAddress: request.headers.get("x-forwarded-for") ?? "local",
    });

    return ok({
      report: {
        id: updated.id,
        reportHash: updated.reportHash,
        type: updated.type,
        createdAt: updated.createdAt.toISOString(),
        data: updated.data,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[report/update]", error);
    return fail("Failed to update report", 500, "INTERNAL");
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const report = await db.report.findUnique({ where: { id } });
    if (!report) throw new ApiError("NOT_FOUND", 404, "Report not found.");

    const isOverseer = user.role === "COMPLIANCE" || user.role === "ADMIN";
    const isOwner = report.userId === user.id;
    if (!isOverseer && !isOwner) {
      throw new ApiError("FORBIDDEN", 403, "You cannot delete this report.");
    }

    await db.report.delete({ where: { id } });

    await writeAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: "REPORT_DELETE",
      resourceType: "report",
      resourceId: id,
      metadata: { reportHash: report.reportHash },
      ipAddress: request.headers.get("x-forwarded-for") ?? "local",
    });

    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[report/delete]", error);
    return fail("Failed to delete report", 500, "INTERNAL");
  }
}
