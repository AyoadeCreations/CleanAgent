"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useWallet } from "@/hooks/use-wallet";
import { loginWithEmail, loginWithWallet, requestWalletNonce, ClientApiError } from "@/lib/client-auth";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, roleHome } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const emailSchema = z.string().trim().email("Enter a valid email address.");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters.");

export function LoginForm() {
  const router = useRouter();
  const { connectAsync, signMessageAsync, connectPending, address, connectors } = useWallet();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState<"demo" | "email" | "wallet" | null>(null);

  async function go(user: { role: string }) {
    router.push(roleHome(user.role as never));
  }

  async function handleDemo(accountEmail: string, label: string) {
    setSubmitting("demo");
    try {
      const user = await loginWithEmail(accountEmail, DEMO_PASSWORD);
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
    const parsedEmail = emailSchema.safeParse(email);
    const parsedPassword = passwordSchema.safeParse(password);
    if (!parsedEmail.success) {
      toast.error(parsedEmail.error.issues[0].message);
      return;
    }
    if (!parsedPassword.success) {
      toast.error(parsedPassword.error.issues[0].message);
      return;
    }
    setSubmitting("email");
    try {
      const user = await loginWithEmail(parsedEmail.data, parsedPassword.data);
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
      const { nonce, message } = await requestWalletNonce(walletAddress);
      const signature = await signMessageAsync({ message });
      const user = await loginWithWallet(walletAddress, nonce, signature, true);
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
        <div className="space-y-1">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-card"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-card"
          />
        </div>
        <Button type="submit" className="w-full" disabled={!email.trim() || !password || submitting !== null}>
          Sign in
        </Button>
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
          {address ? "Connected" : "Connect wallet"}
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
