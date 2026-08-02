import { FingerprintIcon, CoinsIcon, Settings2Icon, ZapIcon, FileBarChart2Icon } from "lucide-react";
import { RevealContainer, RevealItem } from "@/components/motion-reveal";

const steps = [
  {
    icon: FingerprintIcon,
    step: "01",
    title: "Verify identity",
    description: "CVI confirms every actor — humans, businesses, and agents — with a reusable on-chain attestation.",
  },
  {
    icon: CoinsIcon,
    step: "02",
    title: "Verify assets",
    description: "CVA screens tokens, receivables, and collateral so only trusted assets are eligible.",
  },
  {
    icon: Settings2Icon,
    step: "03",
    title: "Configure rules",
    description: "Define allowlists, caps, blocklists, and risk thresholds as code that never goes stale.",
  },
  {
    icon: ZapIcon,
    step: "04",
    title: "Execute transaction",
    description: "CCP validates every request against rules and risk, then executes or blocks deterministically.",
  },
  {
    icon: FileBarChart2Icon,
    step: "05",
    title: "Generate reports",
    description: "Immutable, hash-chained audit reports are produced for compliance and review.",
  },
];

export function Workflow() {
  return (
    <section id="workflow" className="scroll-mt-20 border-y bg-muted/30 py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealContainer className="mx-auto mb-16 max-w-2xl text-center">
          <RevealItem>
            <p className="mb-3 text-xs font-medium tracking-widest text-primary uppercase">
              How it works
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              From identity to audit in one flow
            </h2>
          </RevealItem>
        </RevealContainer>

        <RevealContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {steps.map((step, i) => (
            <RevealItem key={step.step} className="relative">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-card ring-1 ring-border">
                    <step.icon className="size-5 text-primary" aria-hidden="true" />
                  </span>
                  {i < steps.length - 1 && (
                    <span className="hidden h-px flex-1 bg-border lg:block" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <p className="font-mono text-xs text-primary">{step.step}</p>
                  <h3 className="mt-1.5 text-base font-medium">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealContainer>
      </div>
    </section>
  );
}
