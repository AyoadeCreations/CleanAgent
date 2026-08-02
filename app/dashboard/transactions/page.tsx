import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth/session";
import { TransactionsView } from "@/components/dashboard/transactions-view";

export const metadata: Metadata = {
  title: "Transactions",
  description: "Transaction activity and policy decisions",
};

export default async function TransactionsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every payment is scored, policed, and recorded on the audit trail.
        </p>
      </div>
      <TransactionsView role={user.role} />
    </div>
  );
}
