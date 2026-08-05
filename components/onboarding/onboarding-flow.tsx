"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { verifyIdentity, createBusiness, ClientApiError } from "@/lib/client-auth";
import { roleHome } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/types";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckIcon } from "lucide-react";

const STEPS = [
  { label: "Account", description: "Review your profile" },
  { label: "Verify", description: "Verify your business" },
  { label: "Business", description: "Company profile" },
  { label: "Done", description: "You're ready" },
];

const IDENTITY_CHECKS = ["Wallet ownership", "Sanctions screening", "News screening", "Fraud check"];

export function OnboardingFlow({ user }: { user: SessionUser }) {
  const router = useRouter();
  const isBusiness = user.role === "BUSINESS";
  const steps = isBusiness ? STEPS : STEPS.filter((s) => s.label !== "Business");
  const [step, setStep] = React.useState(0);
  const [verifying, setVerifying] = React.useState(false);
  const [verified, setVerified] = React.useState(user.verified);
  const [businessName, setBusinessName] = React.useState("");
  const [businessDescription, setBusinessDescription] = React.useState("");
  const [savingBusiness, setSavingBusiness] = React.useState(false);

  const activeIndex = Math.min(step, steps.length - 1);

  async function handleVerify() {
    setVerifying(true);
    try {
      const status = await verifyIdentity(user.walletAddress);
      setVerified(status.verified);
      toast.success(
        status.verified
          ? `Business verified — ${status.checkCount} checks passed`
          : "Verification was not approved"
      );
      setStep((s) => s + 1);
    } catch (error) {
      toast.error(error instanceof ClientApiError ? error.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  async function handleBusiness() {
    if (!businessName.trim()) {
      toast.error("Enter a business name.");
      return;
    }
    setSavingBusiness(true);
    try {
      if (businessName.trim()) {
        await createBusiness({ name: businessName.trim(), description: businessDescription.trim() || undefined });
      }
      toast.success("Business profile ready");
      setStep((s) => s + 1);
    } catch (error) {
      if (error instanceof ClientApiError && error.code === "ALREADY_EXISTS") {
        setStep((s) => s + 1);
        return;
      }
      toast.error(error instanceof ClientApiError ? error.message : "Failed to create business");
    } finally {
      setSavingBusiness(false);
    }
  }

  function finish() {
    router.push(roleHome(user.role));
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Logo />
        <Badge variant="outline">{user.role.toLowerCase()}</Badge>
      </div>
      <div>
        <Progress value={((activeIndex + 1) / steps.length) * 100} className="h-1.5" />
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          {steps.map((s, i) => (
            <span key={s.label} className={cn("flex items-center gap-1.5", i === activeIndex && "font-medium text-foreground")}>
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border text-[10px]",
                  i < activeIndex
                    ? "border-primary bg-primary text-primary-foreground"
                    : i === activeIndex
                      ? "border-primary text-primary"
                      : "border-border"
                )}
              >
                {i < activeIndex ? <CheckIcon className="size-3" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        {steps[activeIndex].label === "Account" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Your account</h2>
              <p className="text-sm text-muted-foreground">Confirm the details we’ll use across CleanFlow.</p>
            </div>
            <dl className="grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4 rounded-lg border bg-background/60 px-4 py-3">
                <dt className="text-muted-foreground">Wallet</dt>
                <dd className="font-mono">{user.walletAddress}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border bg-background/60 px-4 py-3">
                <dt className="text-muted-foreground">Name</dt>
                <dd>{user.name ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border bg-background/60 px-4 py-3">
                <dt className="text-muted-foreground">Email</dt>
                <dd>{user.email ?? "—"}</dd>
              </div>
            </dl>
            <Button className="w-full" onClick={() => setStep((s) => s + 1)}>
              Continue
            </Button>
          </div>
        )}

        {steps[activeIndex].label === "Verify" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Verify your business</h2>
              <p className="text-sm text-muted-foreground">
                We run a quick verification check against your wallet. This is a simulated check in the MVP.
              </p>
            </div>
            <ul className="grid gap-2">
              {IDENTITY_CHECKS.map((check) => (
                <li
                  key={check}
                  className="flex items-center justify-between rounded-lg border bg-background/60 px-4 py-3 text-sm"
                >
                  <span>{check}</span>
                  {verifying ? (
                    <span className="size-3 animate-spin rounded-full border border-border border-t-primary" />
                  ) : verified ? (
                    <CheckIcon className="size-4 text-emerald-500" />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </li>
              ))}
            </ul>
            <Button className="w-full" onClick={handleVerify} disabled={verifying || verified}>
              {verifying ? "Running checks…" : verified ? "Verified" : "Run verification check"}
            </Button>
            {verified && (
              <Button variant="outline" className="w-full" onClick={() => setStep((s) => s + 1)}>
                Continue
              </Button>
            )}
          </div>
        )}

        {steps[activeIndex].label === "Business" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Business profile</h2>
              <p className="text-sm text-muted-foreground">Tell us about your company. Your automations and safety checks attach here.</p>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="biz-name">Company name</Label>
                <Input
                  id="biz-name"
                  placeholder="Acme Labs"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="biz-desc">Description (optional)</Label>
                <Textarea
                  id="biz-desc"
                  placeholder="What does your business do?"
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                />
              </div>
            </div>
            <Button className="w-full" onClick={handleBusiness} disabled={savingBusiness}>
              {savingBusiness ? "Saving…" : "Create business profile"}
            </Button>
          </div>
        )}

        {steps[activeIndex].label === "Done" && (
          <div className="space-y-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckIcon className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">You’re all set</h2>
              <p className="text-sm text-muted-foreground">
                {verified
                  ? "Your business is verified. You can now send payments and create automations."
                  : "You can continue, but you’ll be prompted to verify before sending payments."}
              </p>
            </div>
            <Button className="w-full" onClick={finish}>
              Go to dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
