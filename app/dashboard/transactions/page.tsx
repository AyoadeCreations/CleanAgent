import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth/session";
import { TransactionsView } from "@/components/dashboard/transactions-view";

export const metadata: Metadata = {
  title: "Payments",
  description: "Payment activity",
};

export default async function TransactionsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every payment is checked, approved, and recorded in your history.
        </p>
      </div>
      <TransactionsView role={user.role} />
    </div>
  );
}
