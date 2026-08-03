import { ShieldCheckIcon, DatabaseIcon, ScaleIcon, BotIcon, FileTextIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RevealContainer, RevealItem } from "@/components/motion-reveal";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: ShieldCheckIcon,
    title: "Verified identity",
    description:
      "Every counterparty passes Cleanverse identity verification (CVI) with on-chain attestation before a single transaction is approved.",
    chips: ["CVI attestation", "On-chain proof"],
  },
  {
    icon: DatabaseIcon,
    title: "Verified assets",
    description:
      "Assets are screened through Cleanverse's asset registry (CVA) so only risk-verified collateral, tokens, and receivables move through your flows.",
    chips: ["CVA screening", "Risk-reviewed assets"],
  },
  {
    icon: ScaleIcon,
    title: "Compliance engine",
    description:
      "Express compliance as code — allowlists, caps, blocklists, and risk thresholds enforced deterministically on every execution.",
    chips: ["Rules as code", "Deterministic"],
  },
  {
    icon: BotIcon,
    title: "Autonomous agents",
    description:
      "Grant AI agents granular permissions and spending limits. They execute approved actions within boundaries you control.",
    chips: ["Scoped permissions", "Spending caps"],
  },
  {
    icon: FileTextIcon,
    title: "Audit reports",
    description:
      "Every decision is hashed and logged to an immutable audit trail, ready for regulators, auditors, and proof of control.",
    chips: ["Immutable ledger", "Signed hashes"],
  },
];

export function Features() {
  return (
    <section id="platform" className="scroll-mt-20 py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealContainer className="mx-auto mb-14 max-w-2xl text-center">
          <RevealItem>
            <p className="mb-3 text-xs font-medium tracking-widest text-primary uppercase">
              Platform
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Every layer of trust, automated
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="mt-4 text-base text-muted-foreground">
              CleanFlow replaces manual KYC spreadsheets, ad-hoc approvals, and un-auditable
              treasury stacks with a single programmable layer.
            </p>
          </RevealItem>
        </RevealContainer>

        <RevealContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <RevealItem key={feature.title} className="h-full">
              <Card className="group h-full transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_40px_-16px_rgba(37,99,235,0.35)]">
                <CardContent className="flex h-full flex-col p-6">
                  <div
                    className={cn(
                      "mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20",
                      "transition-transform duration-300 group-hover:scale-105",
                    )}
                  >
                    <feature.icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading text-base font-semibold tracking-tight">{feature.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {feature.chips.map((chip) => (
                      <li
                        key={chip}
                        className="rounded-md border bg-surface/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                      >
                        {chip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </RevealItem>
          ))}

          <RevealItem className="h-full">
            <Card className="h-full border-dashed bg-primary/[0.04]">
              <CardContent className="flex h-full flex-col justify-center p-6">
                <h3 className="font-heading text-base font-semibold tracking-tight">And more</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Escrow releases, treasury sweeps, invoice settlement, and multi-entity payroll
                  are all first-class citizens.
                </p>
              </CardContent>
            </Card>
          </RevealItem>
        </RevealContainer>
      </div>
    </section>
  );
}
