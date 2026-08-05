import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth/session";
import { AgentDashboard } from "@/components/dashboard/agent-dashboard";

export const metadata: Metadata = { title: "Agent" };

export default async function AgentHomePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-6xl">
      <AgentDashboard userName={user.name ?? undefined} verified={user.verified} />
    </div>
  );
}
