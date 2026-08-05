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
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { navItemsFor, isNavActive } from "@/lib/nav";
import type { Role } from "@/lib/types";

const ICONS = {
  Overview: LayoutDashboardIcon,
  Payments: ArrowLeftRightIcon,
  Automations: BotIcon,
  "Account health": ShieldCheckIcon,
  Activity: FileBarChart2Icon,
  Settings: SettingsIcon,
} as const;

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = navItemsFor(role);

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-card/40 lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b px-5">
        <Link href="/" className="flex items-center gap-2">
          <Logo markClassName="size-6" />
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
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary" aria-hidden="true" />
              )}
              <Icon
                className={cn(
                  "size-4 transition-transform duration-200 group-hover:scale-110",
                  active && "text-primary"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <p className="text-sm font-medium capitalize">{role}</p>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          <p className="font-mono text-xs text-muted-foreground">Monad testnet</p>
        </div>
      </div>
    </aside>
  );
}
