import { FingerprintIcon, CoinsIcon, ScaleIcon, BotIcon, FileCheck2Icon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RevealContainer, RevealItem } from "@/components/motion-reveal";

const features = [
  {
    icon: FingerprintIcon,
    title: "Verified identity",
    description:
      "Every counterparty passes Cleanverse identity verification (CVI) with on-chain attestation before a single transaction is approved.",
  },
  {
    icon: CoinsIcon,
    title: "Verified assets",
    description:
      "Assets are screened through Cleanverse's asset registry (CVA) so only risk-verified collateral, tokens, and receivables move through your flows.",
  },
  {
    icon: ScaleIcon,
    title: "Compliance rules",
    description:
      "Express compliance as code — allowlists, caps, blocklists, and risk thresholds enforced deterministically on every execution.",
  },
  {
    icon: BotIcon,
    title: "Autonomous agents",
    description:
      "Grant AI agents granular permissions and spending limits. They execute approved actions within boundaries you control.",
  },
  {
    icon: FileCheck2Icon,
    title: "Audit reports",
    description:
      "Every decision is hashed and logged to an immutable audit trail, ready for regulators, auditors, and proof of control.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-24">
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
          {features.map((feature, i) => (
            <RevealItem key={feature.title}>
              <Card className={i === 4 ? "h-full lg:col-span-1" : "h-full"}>
                <CardHeader>
                  <div className="mb-3 inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                    <feature.icon className="size-4.5" aria-hidden="true" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </RevealItem>
          ))}

          <RevealItem>
            <Card className="h-full border-dashed bg-primary/[0.04] ring-primary/20">
              <CardHeader>
                <div className="mb-3 inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                  <FingerprintIcon className="size-4.5" aria-hidden="true" />
                </div>
                <CardTitle>And more</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Escrow releases, treasury sweeps, invoice settlement, and multi-entity payroll
                  are all first-class citizens.
                </CardDescription>
              </CardContent>
            </Card>
          </RevealItem>
        </RevealContainer>
      </div>
    </section>
  );
}
