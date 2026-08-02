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
      <div className="relative hidden overflow-hidden border-r bg-card lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(70% 60% at 20% 0%, oklch(0.7 0.14 165 / 0.14), transparent 60%)",
          }}
        />
        <Logo />
        <div className="relative max-w-md">
          <h2 className="text-balance text-3xl font-semibold tracking-tight">
            Trust Every Transaction
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Verified identity, verified assets, programmable compliance, autonomous execution,
            and immutable audit trails — the application layer on Cleanverse.
          </p>
          <dl className="mt-10 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border bg-card/60 p-4">
              <dt className="text-xs text-muted-foreground">Verified identities</dt>
              <dd className="mt-1 font-mono text-lg font-semibold">5.2M+</dd>
            </div>
            <div className="rounded-lg border bg-card/60 p-4">
              <dt className="text-xs text-muted-foreground">Volume orchestrated</dt>
              <dd className="mt-1 font-mono text-lg font-semibold">$940M</dd>
            </div>
          </dl>
        </div>
        <p className="relative text-xs text-muted-foreground">© {new Date().getFullYear()} CleanFlow</p>
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
