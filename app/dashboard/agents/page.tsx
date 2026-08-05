import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth/session";
import { AgentsView } from "@/components/dashboard/agents-view";

export const metadata: Metadata = {
  title: "Automations",
  description: "Payment automation management",
};

export default async function AgentsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Automations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Payment automations with enforced daily and monthly spending limits.
        </p>
      </div>
      <AgentsView />
    </div>
  );
}
