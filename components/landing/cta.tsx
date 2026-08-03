import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevealContainer, RevealItem } from "@/components/motion-reveal";

export function Cta() {
  return (
    <section className="py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealContainer>
          <RevealItem>
            <div
              className="relative overflow-hidden rounded-2xl border bg-card px-6 py-16 text-center sm:px-12"
              aria-hidden="true"
            >
              <div
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                  background:
                    "radial-gradient(60% 80% at 50% 0%, oklch(0.7 0.14 165 / 0.18), transparent 70%)",
                }}
              />
              <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Put verification, compliance, and execution on autopilot
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
                Spin up a workspace, verify your identity, and run your first rule-validated
                transaction in minutes.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" render={<Link href="/register" />}>
                  Start building
                  <ArrowRightIcon className="size-4" />
                </Button>
                <Button size="lg" variant="outline" render={<Link href="/demo" />}>
                  View demonstration
                </Button>
              </div>
            </div>
          </RevealItem>
        </RevealContainer>
      </div>
    </section>
  );
}
