import {
  TruckIcon,
  FactoryIcon,
  PackageIcon,
  ShipIcon,
  UsersIcon,
  StoreIcon,
} from "lucide-react";
import { RevealContainer, RevealItem } from "@/components/motion-reveal";

const audiences = [
  {
    icon: TruckIcon,
    title: "Logistics",
    description:
      "Pay freight, customs, and last-mile partners fast — with records you can actually find.",
  },
  {
    icon: FactoryIcon,
    title: "Manufacturers",
    description:
      "Keep production lines moving with supplier payments that land on time, every time.",
  },
  {
    icon: PackageIcon,
    title: "Suppliers",
    description:
      "Get paid reliably for goods delivered, with clear status on every payment.",
  },
  {
    icon: ShipIcon,
    title: "Exporters",
    description:
      "Pay cross-border invoices without the bank queues and international friction.",
  },
  {
    icon: UsersIcon,
    title: "Payroll providers",
    description:
      "Run payroll for many businesses from one workspace, with clean per-client records.",
  },
  {
    icon: StoreIcon,
    title: "Merchants",
    description:
      "Accept payments and keep your books clean — every transaction accounted for.",
  },
];

export function UseCases() {
  return (
    <section id="who-its-for" className="scroll-mt-20 bg-muted/30 py-[120px]">
      <div className="mx-auto w-full max-w-[1440px] px-8">
        <RevealContainer className="mx-auto mb-16 max-w-2xl text-center">
          <RevealItem>
            <p className="mb-3 text-xs font-medium tracking-widest text-primary uppercase">
              Who it&apos;s built for
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for the people who move money
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="mt-4 text-base text-muted-foreground">
              From trucking fleets to factory floors, if you pay people, we make it simple.
            </p>
          </RevealItem>
        </RevealContainer>

        <RevealContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((audience) => (
            <RevealItem key={audience.title} className="h-full">
              <div className="flex h-full flex-col gap-4 rounded-2xl border bg-card p-8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <audience.icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{audience.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {audience.description}
                  </p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealContainer>
      </div>
    </section>
  );
}
