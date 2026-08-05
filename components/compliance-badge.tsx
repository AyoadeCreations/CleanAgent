"use client";

import { BadgeCheckIcon, ClockIcon, XCircleIcon, BanIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tone = "verified" | "pending" | "restricted";

const TONE_META: Record<
  Tone,
  { className: string; icon: typeof BadgeCheckIcon }
> = {
  verified: { className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30", icon: BadgeCheckIcon },
  pending: { className: "bg-amber-500/10 text-amber-500 border-amber-500/30", icon: ClockIcon },
  restricted: { className: "bg-red-500/10 text-red-500 border-red-500/30", icon: XCircleIcon },
};

const STATUS_TONE: Record<string, Tone> = {
  VERIFIED: "verified",
  ACTIVE: "verified",
  APPROVED: "verified",
  PASS: "verified",
  PENDING: "pending",
  UNVERIFIED: "pending",
  PAUSED: "pending",
  SUSPENDED: "pending",
  FLAGGED: "pending",
  REJECTED: "restricted",
  BLOCKED: "restricted",
  DEACTIVATED: "restricted",
  RESTRICTED: "restricted",
  FAILED: "restricted",
  FAIL: "restricted",
};

export function ComplianceBadge({
  status,
  label,
  icon,
}: {
  status: string;
  label?: string;
  icon?: boolean;
}) {
  const tone = STATUS_TONE[status.toUpperCase()] ?? "pending";
  const meta = TONE_META[tone];
  const Icon = icon === false ? null : meta.icon;

  return (
    <Badge variant="outline" className={cn("font-mono", meta.className)}>
      {Icon && <Icon className="size-3" />}
      {(label ?? status).toLowerCase()}
    </Badge>
  );
}

export function VerifiedEntityBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <Badge variant="outline" className="font-mono bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
      <BadgeCheckIcon className="size-3" />
      Verified business
    </Badge>
  ) : (
    <Badge variant="outline" className="font-mono bg-amber-500/10 text-amber-500 border-amber-500/30">
      <ClockIcon className="size-3" />
      Verification pending
    </Badge>
  );
}

export function RestrictedBadge({ reason }: { reason?: string }) {
  return (
    <Badge variant="outline" className="font-mono bg-red-500/10 text-red-500 border-red-500/30">
      <BanIcon className="size-3" />
      restricted{reason ? ` · ${reason.toLowerCase()}` : ""}
    </Badge>
  );
}
