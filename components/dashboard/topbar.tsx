"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShieldCheckIcon, MenuIcon } from "lucide-react";
import * as React from "react";
import { truncateAddress } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/types";
import { navItemsFor, isNavActive } from "@/lib/nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/dashboard/user-menu";

export function Topbar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = React.useState(false);
  const items = navItemsFor(user.role);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-card/40 px-4 sm:px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground lg:hidden">
        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open navigation" />}>
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="border-b px-5 py-4">
              <SheetTitle className="text-left text-base">Navigation</SheetTitle>
            </SheetHeader>
            <nav className="space-y-1 p-3">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setNavOpen(false)}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isNavActive(pathname, item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 border-t pt-4">
                <p className="px-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {user.role.toLowerCase()}
                </p>
                <p className="mt-1 px-3 font-mono text-xs text-muted-foreground">{truncateAddress(user.walletAddress)}</p>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
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
        <UserMenu user={user} />
      </div>
    </header>
  );
}
