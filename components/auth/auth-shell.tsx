import * as React from "react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export function AuthShell({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col lg:grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r bg-gradient-to-b from-[#0a79d8] to-[#18a6ff] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{ background: "radial-gradient(70% 60% at 80% 20%, rgba(255,255,255,0.4), transparent 60%)" }}
        />
        <Logo inverse />
        <div className="relative max-w-md">
          <h2 className="text-balance text-3xl font-semibold tracking-tight">
            Trust Every Transaction
          </h2>
          <p className="mt-4 text-base leading-7 text-white/85">
            Verified identity, verified assets, programmable compliance, autonomous execution,
            and immutable audit trails — the application layer on Cleanverse.
          </p>
          <dl className="mt-10 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur">
              <dt className="text-white/70">Verified identities</dt>
              <dd className="mt-1 font-mono text-lg font-semibold">15,000+</dd>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur">
              <dt className="text-white/70">Settled volume</dt>
              <dd className="mt-1 font-mono text-lg font-semibold">$12.4M</dd>
            </div>
          </dl>
        </div>
        <p className="relative text-xs text-white/60">© {new Date().getFullYear()} CleanFlow</p>
      </div>

      <main className={cn("flex flex-1 items-center justify-center px-4 py-12 sm:px-6")}>
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
