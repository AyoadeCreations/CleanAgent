import { fail, ok, requireApiUser, ApiError } from "@/lib/api";
import { buildDashboardSummary } from "@/lib/database/summary";

export async function GET() {
  try {
    const user = await requireApiUser();
    const summary = await buildDashboardSummary(user);
    return ok(summary);
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[dashboard]", error);
    return fail("Failed to load dashboard", 500, "INTERNAL");
  }
}
