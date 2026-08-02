import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth/session";
import { SettingsView } from "@/components/dashboard/settings-view";

export const metadata: Metadata = {
  title: "Settings",
  description: "Account settings",
};

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Profile, identity, and business settings.</p>
      </div>
      <SettingsView user={user} />
    </div>
  );
}
