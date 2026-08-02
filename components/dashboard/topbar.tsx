"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheckIcon, LogOutIcon, CopyIcon, CheckIcon } from "lucide-react";
import * as React from "react";
import { logout } from "@/lib/client-auth";
import { truncateAddress } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export function Topbar({ user }: { user: SessionUser }) {
  const router = useRouter();
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

  async function handleLogout() {
    await logout();
    toast.success("Signed out");
    router.push("/login");
  }

  const initials =
    user.name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? user.walletAddress.slice(2, 4).toUpperCase();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-card/40 px-4 sm:px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground lg:hidden">
        <ShieldCheckIcon className="size-4" />
        <span>CleanFlow</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Badge
          variant="outline"
          className={cn(
            "hidden sm:inline-flex",
            user.verified ? "text-emerald-500" : "text-amber-500"
          )}
        >
          {user.verified ? "Verified" : "Unverified"}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="font-medium">{user.name ?? "Wallet user"}</div>
              <div className="mt-0.5 flex items-center gap-1 text-xs font-normal text-muted-foreground">
                <span className="font-mono">{truncateAddress(user.walletAddress)}</span>
                <button type="button" onClick={handleCopy} className="transition-colors hover:text-foreground">
                  {copied ? <CheckIcon className="size-3" /> : <CopyIcon className="size-3" />}
                </button>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/onboarding")}>
              Re-run onboarding
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOutIcon />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
