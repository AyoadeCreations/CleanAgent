"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FingerprintIcon, CopyIcon, CheckIcon } from "lucide-react";
import { verifyIdentity } from "@/lib/client-auth";
import { useBusiness } from "@/hooks/use-api";
import { truncateAddress } from "@/lib/format";
import type { SessionUser } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function SettingsView({ user }: { user: SessionUser }) {
  const router = useRouter();
  const { data: businessData, isLoading: businessLoading } = useBusiness();
  const [verifying, setVerifying] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Could not copy address");
    }
  }

  async function handleVerify() {
    setVerifying(true);
    try {
      const status = await verifyIdentity(user.walletAddress);
      toast.success(status.verified ? "Business re-verified" : "Verification rejected");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account and business verification status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Name</dt>
              <dd>{user.name ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{user.email ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="uppercase">{user.role.toLowerCase()}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Wallet</dt>
              <dd className="flex items-center gap-1.5 font-mono">
                {truncateAddress(user.walletAddress)}
                <button type="button" onClick={handleCopy} className="text-muted-foreground transition-colors hover:text-foreground">
                  {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
                </button>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Business verification</dt>
              <dd>
                <Badge
                  variant="outline"
                  className={user.verified ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}
                >
                  {user.verified ? "Verified business" : "Not verified yet"}
                </Badge>
              </dd>
            </div>
          </dl>
          <Button variant="outline" className="w-full" onClick={handleVerify} disabled={verifying}>
            <FingerprintIcon />
            {verifying ? "Running checks…" : "Re-run business verification"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business</CardTitle>
          <CardDescription>Company profile for business accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          {businessLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : businessData?.business ? (
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{businessData.business.name}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant="outline">{businessData.business.status.toLowerCase()}</Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Agents</dt>
                <dd className="font-mono">{businessData.business.agentCount}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Rules</dt>
                <dd className="font-mono">{businessData.business.ruleCount}</dd>
              </div>
              {businessData.business.description && (
                <div>
                  <dt className="text-muted-foreground">Description</dt>
                  <dd className="mt-1 text-muted-foreground">{businessData.business.description}</dd>
                </div>
              )}
            </dl>
          ) : (
            <div className="text-sm text-muted-foreground">
              {user.role === "BUSINESS"
                ? "No business profile yet. Set one up from onboarding."
                : "Business accounts can attach agents and rules."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
