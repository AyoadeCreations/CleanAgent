"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  LayoutDashboardIcon,
  SettingsIcon,
  BellIcon,
  UserRoundIcon,
  LogOutIcon,
  CopyIcon,
  CheckIcon,
  Loader2Icon,
  ShieldCheckIcon,
  LogInIcon,
} from "lucide-react";
import { logout } from "@/lib/client-auth";
import { truncateAddress } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface MenuItem {
  key: string;
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  destructive?: boolean;
  onSelect?: () => void | Promise<void>;
}

function initialsFor(user: SessionUser | null): string {
  if (!user) return "?";
  const fromName = user.name
    ?.split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (fromName) return fromName;
  return user.walletAddress.slice(0, 2).toUpperCase() || "?";
}

function useSafeNavigate() {
  const router = useRouter();
  return React.useCallback(
    (href: string) => {
      try {
        router.push(href);
      } catch {
        try {
          window.location.assign(href);
        } catch {
          /* noop */
        }
      }
    },
    [router],
  );
}

export function UserMenu({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [pending, setPending] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const navigate = useSafeNavigate();
  const pathname = usePathname();

  const close = React.useCallback(() => setOpen(false), []);

  const handleCopy = React.useCallback(async () => {
    if (!user) return;
    try {
      await navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Could not copy address");
    }
  }, [user]);

  const handleSelect = React.useCallback(
    async (item: MenuItem) => {
      if (pending) return;
      setPending(item.key);
      close();
      try {
        if (item.onSelect) {
          await item.onSelect();
        } else if (item.href) {
          navigate(item.href);
        }
      } catch {
        if (item.href) {
          try {
            window.location.assign(item.href);
          } catch {
            toast.error(`Could not open ${item.label}`);
          }
        } else {
          toast.error(`Could not open ${item.label}`);
        }
      } finally {
        setPending(null);
      }
    },
    [navigate, pending, close],
  );

  const handleLogout = React.useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setPending("logout");
    try {
      await logout();
      toast.success("Signed out");
      navigate("/login");
    } catch {
      toast.error("Could not sign out. Please try again.");
      setBusy(false);
      setPending(null);
    }
  }, [busy, navigate]);

  // Loading state (used when the menu opens or an action is in flight).
  const isPending = pending !== null;

  if (!user) {
    return (
      <Button variant="outline" size="sm" render={<Link href="/login" />}>
        <LogInIcon className="size-4" />
        Sign in
      </Button>
    );
  }

  const items: MenuItem[] = [
    {
      key: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboardIcon,
      onSelect: () => navigate("/dashboard"),
    },
    {
      key: "settings",
      label: "Settings",
      href: "/dashboard/settings",
      icon: SettingsIcon,
      onSelect: () => navigate("/dashboard/settings"),
    },
    {
      key: "notifications",
      label: "Notifications",
      icon: BellIcon,
      onSelect: () => {
        toast("You're all caught up — no new notifications.");
      },
    },
    {
      key: "profile",
      label: "Profile",
      href: "/dashboard/settings",
      icon: UserRoundIcon,
      onSelect: () => navigate("/dashboard/settings"),
    },
  ];

  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex size-8 items-center justify-center rounded-full bg-muted">?</span>
          <Button variant="outline" size="sm" render={<Link href="/dashboard" />}>
            Go to dashboard
          </Button>
        </div>
      }
    >
      <div className="relative">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Open user menu"
          onClick={() => setOpen((v) => !v)}
          className="group relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full outline-none ring-ring transition-shadow focus-visible:ring-2"
        >
          <Avatar className="size-8 transition-transform group-hover:scale-105">
            <AvatarFallback>{initialsFor(user)}</AvatarFallback>
          </Avatar>
          <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-background" aria-hidden="true" />
          {isPending && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
              <Loader2Icon className="size-4 animate-spin text-primary" />
            </span>
          )}
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={close} aria-hidden="true" />
            <div
              role="menu"
              aria-label="User menu"
              className="absolute right-0 z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-[0_16px_48px_rgba(0,0,0,0.12)]"
            >
              <div className="flex items-center gap-3 rounded-lg px-2.5 py-2.5">
                <Avatar className="size-9">
                  <AvatarFallback>{initialsFor(user)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{user.name ?? "Wallet user"}</p>
                  <p className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                    <span className="truncate">{truncateAddress(user.walletAddress)}</span>
                    <button
                      type="button"
                      aria-label="Copy wallet address"
                      onClick={handleCopy}
                      className="shrink-0 rounded p-0.5 transition-colors hover:text-foreground"
                    >
                      {copied ? <CheckIcon className="size-3 text-emerald-500" /> : <CopyIcon className="size-3" />}
                    </button>
                  </p>
                </div>
              </div>

              <div className="px-2.5 pb-1.5 pt-0.5">
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1",
                    user.verified ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : "border-amber-500/30 bg-amber-500/10 text-amber-500",
                  )}
                >
                  <ShieldCheckIcon className="size-3" />
                  {user.verified ? "Verified business" : "Verification pending"}
                </Badge>
              </div>

              <div className="border-t border-border/60 py-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isPendingItem = pending === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="menuitem"
                      disabled={isPendingItem || busy}
                      onClick={() => handleSelect(item)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm outline-none transition-colors",
                        "text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent",
                        "disabled:pointer-events-none disabled:opacity-60",
                      )}
                    >
                      {isPendingItem ? (
                        <Loader2Icon className="size-4 animate-spin" />
                      ) : (
                        <Icon className="size-4 text-muted-foreground" />
                      )}
                      <span className="flex-1">{item.label}</span>
                      {item.href && pathname === item.href && (
                        <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-border/60 pt-1">
                <button
                  type="button"
                  role="menuitem"
                  disabled={busy || isPending}
                  onClick={handleLogout}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm outline-none transition-colors",
                    "text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10 disabled:pointer-events-none disabled:opacity-60",
                  )}
                >
                  {busy ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <LogOutIcon className="size-4" />
                  )}
                  <span className="flex-1">Log out</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
