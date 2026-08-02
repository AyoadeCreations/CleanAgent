"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWallet } from "@/hooks/use-wallet";
import { loginWithEmail, loginWithWallet, ClientApiError } from "@/lib/client-auth";
import { DEMO_ACCOUNTS, roleHome } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function LoginForm() {
  const router = useRouter();
  const { connectAsync, signMessageAsync, connectPending, address, connectors } = useWallet();
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState<"demo" | "email" | "wallet" | null>(null);

  async function go(user: { role: string }) {
    router.push(roleHome(user.role as never));
  }

  async function handleDemo(accountEmail: string, label: string) {
    setSubmitting("demo");
    try {
      const user = await loginWithEmail(accountEmail);
      toast.success(`Signed in as ${label}`);
      await go(user);
    } catch (error) {
      toast.error(error instanceof ClientApiError ? error.message : "Login failed");
    } finally {
      setSubmitting(null);
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting("email");
    try {
      const user = await loginWithEmail(email.trim());
      toast.success("Signed in");
      await go(user);
    } catch (error) {
      toast.error(error instanceof ClientApiError ? error.message : "Login failed");
    } finally {
      setSubmitting(null);
    }
  }

  async function handleWallet() {
    setSubmitting("wallet");
    try {
      const result = await connectAsync({ connector: connectors[0] });
      const walletAddress = result.accounts[0];
      const signature = await signMessageAsync({
        message: `Sign in to CleanFlow\n\nWallet: ${walletAddress}`,
      });
      const user = await loginWithWallet(walletAddress, true);
      toast.success(`Connected ${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`);
      await go(user);
    } catch (error) {
      toast.error(error instanceof ClientApiError ? error.message : "Wallet connection cancelled");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.role}
            type="button"
            onClick={() => handleDemo(account.email, account.label)}
            disabled={submitting !== null}
            className={cn(
              "group flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3 text-left transition-colors",
              "hover:border-primary/50 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{account.label}</span>
                <Badge variant="outline" className="text-[10px]">
                  demo
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{account.description}</p>
            </div>
            <span className="text-xs text-muted-foreground transition-colors group-hover:text-primary">
              {submitting === "demo" ? "Signing in…" : "Sign in →"}
            </span>
          </button>
        ))}
      </div>

      <Separator className="bg-border/60" />

      <form onSubmit={handleEmail} className="space-y-3">
        <Label htmlFor="login-email">Email</Label>
        <div className="flex gap-2">
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-card"
          />
          <Button type="submit" disabled={!email.trim() || submitting !== null}>
            Continue
          </Button>
        </div>
      </form>

      <Separator className="bg-border/60" />

      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleWallet}
          disabled={submitting !== null || connectPending}
        >
          {address ? "Connect wallet" : "Connect wallet"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          No account yet?{" "}
          <a href="/register" className="font-medium text-primary hover:underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
