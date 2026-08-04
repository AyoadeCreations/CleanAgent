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
              className="relative overflow-hidden rounded-[24px] border bg-card px-6 py-20 text-center sm:px-12"
              aria-hidden="true"
            >
              <div
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                  background:
                    "radial-gradient(60% 80% at 50% 0%, oklch(0.5 0.16 255 / 0.08), transparent 70%)",
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
                <Link
                  href="/demo"
                  className="group inline-flex items-center gap-2 rounded-full bg-lime px-7 py-[18px] text-base font-semibold text-black transition-transform hover:scale-105"
                >
                  Start Demo
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Button size="lg" variant="outline" render={<Link href="/register" />}>
                  Create account
                </Button>
              </div>
            </div>
          </RevealItem>
        </RevealContainer>
      </div>
    </section>
  );
}
