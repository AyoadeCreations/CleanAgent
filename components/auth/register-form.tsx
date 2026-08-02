"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWallet } from "@/hooks/use-wallet";
import { registerAccount, ClientApiError } from "@/lib/client-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function RegisterForm() {
  const router = useRouter();
  const { connectAsync, connectPending, address, connectors } = useWallet();
  const [walletAddress, setWalletAddress] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<"MERCHANT" | "BUSINESS">("MERCHANT");
  const [submitting, setSubmitting] = React.useState(false);

  const effectiveAddress = address ?? walletAddress;

  async function handleConnect() {
    try {
      const result = await connectAsync({ connector: connectors[0] });
      const addr = result.accounts[0];
      setWalletAddress(addr);
    } catch {
      toast.error("Wallet connection cancelled");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^0x[0-9a-fA-F]{40}$/.test(effectiveAddress)) {
      toast.error("Enter a valid EVM wallet address or connect your wallet.");
      return;
    }
    setSubmitting(true);
    try {
      const user = await registerAccount({
        walletAddress: effectiveAddress,
        email: email.trim() || undefined,
        name: name.trim() || undefined,
        role,
      });
      toast.success("Account created");
      router.push("/onboarding");
    } catch (error) {
      toast.error(error instanceof ClientApiError ? error.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="register-wallet">Wallet address</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleConnect} disabled={connectPending}>
            {address ? "Connected" : "Connect wallet"}
          </Button>
        </div>
        <Input
          id="register-wallet"
          placeholder="0x…"
          value={effectiveAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          readOnly={Boolean(address)}
          className="font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-name">Name</Label>
        <Input
          id="register-name"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Email (optional)</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Account type</Label>
        <RadioGroup value={role} onValueChange={(v) => setRole(v as "MERCHANT" | "BUSINESS")}>          <div className="grid gap-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-3">
              <RadioGroupItem value="MERCHANT" />
              <div>
                <div className="text-sm font-medium">Merchant</div>
                <p className="text-xs text-muted-foreground">Receive payments and manage invoices.</p>
              </div>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-3">
              <RadioGroupItem value="BUSINESS" />
              <div>
                <div className="text-sm font-medium">Business</div>
                <p className="text-xs text-muted-foreground">Suppliers, payroll, agents, and rules.</p>
              </div>
            </label>
          </div>
        </RadioGroup>
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}
