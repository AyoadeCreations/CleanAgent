import "server-only";
import { redirect } from "next/navigation";
import type { Role, SessionUser } from "@/lib/types";
import { getSessionUser } from "./session";
import { roleHome } from "@/lib/constants";

/**
 * Require an authenticated session and one of the allowed roles.
 * Redirects to /login when unauthenticated, or to the user's role home
 * when their role is not permitted for the requested route.
 */
export async function requirePageRole(allowed: Role[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!allowed.includes(user.role)) redirect(roleHome(user.role));
  return user;
}