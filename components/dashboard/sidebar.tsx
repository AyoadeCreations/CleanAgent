"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  ArrowLeftRightIcon,
  BotIcon,
  ShieldCheckIcon,
  FileBarChart2Icon,
  SettingsIcon,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { cn } from "@/lib/utils";
import { navItemsFor, isNavActive } from "@/lib/nav";
import type { Role } from "@/lib/types";

const ICONS = {
  Overview: LayoutDashboardIcon,
  Transactions: ArrowLeftRightIcon,
  Agents: BotIcon,
  Compliance: ShieldCheckIcon,
  Reports: FileBarChart2Icon,
  Settings: SettingsIcon,
} as const;

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = navItemsFor(role);

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-card/40 lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b px-5">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const Icon = ICONS[item.label as keyof typeof ICONS] ?? LayoutDashboardIcon;
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">{role.toLowerCase()}</p>
        <p className="mt-0.5">CleanFlow · Monad testnet</p>
      </div>
    </aside>
  );
}
