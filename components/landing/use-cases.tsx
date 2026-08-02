import { BanknoteIcon, StoreIcon, TruckIcon, LockIcon, LandmarkIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RevealContainer, RevealItem } from "@/components/motion-reveal";

const useCases = [
  {
    icon: BanknoteIcon,
    title: "Payroll",
    description:
      "Run multi-entity payroll runs where each payout is identity-checked, rule-validated, and hash-chained to the run's ledger.",
    accent: "emerald",
  },
  {
    icon: StoreIcon,
    title: "Merchant payments",
    description:
      "Accept payments from verified customers, mint invoices, and settle with full provenance your finance team can trust.",
    accent: "teal",
  },
  {
    icon: TruckIcon,
    title: "Supplier payments",
    description:
      "Pay suppliers from an allowlist only — every transfer matched to a purchase order and an immutable invoice.",
    accent: "blue",
  },
  {
    icon: LockIcon,
    title: "Escrow",
    description:
      "Lock funds in programmable escrow and release them only when both parties and the compliance layer agree.",
    accent: "amber",
  },
  {
    icon: LandmarkIcon,
    title: "Treasury management",
    description:
      "Automate treasury sweeps and internal moves with per-agent budgets, risk screens, and a full audit trail.",
    accent: "violet",
  },
];

const accents: Record<string, string> = {
  emerald: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
  teal: "text-teal-500 dark:text-teal-400 bg-teal-500/10 ring-teal-500/20",
  blue: "text-blue-500 dark:text-blue-400 bg-blue-500/10 ring-blue-500/20",
  amber: "text-amber-500 dark:text-amber-400 bg-amber-500/10 ring-amber-500/20",
  violet: "text-violet-500 dark:text-violet-400 bg-violet-500/10 ring-violet-500/20",
};

export function UseCases() {
  return (
    <section id="use-cases" className="scroll-mt-20 py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealContainer className="mx-auto mb-14 max-w-2xl text-center">
          <RevealItem>
            <p className="mb-3 text-xs font-medium tracking-widest text-primary uppercase">
              Use cases
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for the flows you run today
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="mt-4 text-base text-muted-foreground">
              Whether you pay people, vendors, or protocols, CleanFlow wraps every move in the same
              verified, compliant envelope.
            </p>
          </RevealItem>
        </RevealContainer>

        <RevealContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {useCases.slice(0, 3).map((uc) => (
            <UseCaseCard key={uc.title} uc={uc} accent={accents[uc.accent]} />
          ))}
          <div className="md:col-span-2 lg:col-span-3">
            <RevealContainer className="grid gap-4 sm:grid-cols-2">
              {useCases.slice(3).map((uc) => (
                <RevealItem key={uc.title}>
                  <UseCaseCard uc={uc} accent={accents[uc.accent]} />
                </RevealItem>
              ))}
            </RevealContainer>
          </div>
        </RevealContainer>
      </div>
    </section>
  );
}

function UseCaseCard({
  uc,
  accent,
}: {
  uc: (typeof useCases)[number];
  accent: string;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className={`mb-3 inline-flex size-9 items-center justify-center rounded-lg ring-1 ${accent}`}>
          <uc.icon className="size-4.5" aria-hidden="true" />
        </div>
        <CardTitle>{uc.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{uc.description}</CardDescription>
      </CardContent>
    </Card>
  );
}
