"use client";

import * as React from "react";
import Link from "next/link";
import { MenuIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#platform", label: "Products" },
  { href: "#use-cases", label: "Solutions" },
  { href: "/compliance", label: "Developers" },
  { href: "/reports", label: "Resources" },
  { href: "/register", label: "Pricing" },
];

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors",
        scrolled ? "border-border/70 bg-background/80" : "border-transparent bg-background/40",
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-6 lg:px-12">
        <Link href="/" className="shrink-0" aria-label="CleanFlow home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" render={<Link href="/login" />}>
            Login
          </Button>
          <Link
            href="/demo"
            className="inline-flex items-center rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105"
          >
            Start demo
          </Link>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <XIcon /> : <MenuIcon />}
        </Button>
      </div>

      {open && (
        <div className="border-t bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Button variant="outline" render={<Link href="/login" onClick={() => setOpen(false)} />}>
                Login
              </Button>
              <Link
                href="/demo"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-black"
              >
                Start demo
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
