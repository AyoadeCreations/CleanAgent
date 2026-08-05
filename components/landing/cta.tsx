import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DemoButton } from "@/components/landing/demo-button";
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
                Your business, ready for trusted payments
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
                Set up your workspace, verify your business once, and send your first payment
                in minutes.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <DemoButton className="px-7 py-[18px] text-base" />
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
