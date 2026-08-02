import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth/session";
import { RoleHome } from "@/components/dashboard/role-home";

export const metadata: Metadata = { title: "Agent" };

export default async function AgentHomePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-6xl">
      <RoleHome role={user.role} verified={user.verified} />
    </div>
  );
}
