import Image from "next/image";
import {
  FileTextIcon,
  ArrowRightLeftIcon,
  RefreshCcwIcon,
  WalletIcon,
  LandmarkIcon,
  TruckIcon,
  ScaleIcon,
  ShieldCheckIcon,
  FileCheck2Icon,
} from "lucide-react";
import { RevealContainer, RevealItem } from "@/components/motion-reveal";
import { cn } from "@/lib/utils";

const personas = [
  {
    kicker: "Merchants",
    title: "Invoices, settlements, and reconciliation on autopilot",
    description:
      "Issue invoices from verified customers, settle in real time, and reconcile every payout with a single shared ledger — no spreadsheets, no chase.",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80",
    alt: "A merchant accepting a payment at a point-of-sale terminal",
    stat: { value: "2.4 days", label: "faster settlement cycle" },
    points: [
      { icon: FileTextIcon, title: "Invoices", detail: "Mint verifiable invoices on every order" },
      { icon: ArrowRightLeftIcon, title: "Settlements", detail: "Real-time release on policy approval" },
      { icon: RefreshCcwIcon, title: "Reconciliation", detail: "One shared ledger, always in balance" },
    ],
  },
  {
    kicker: "Businesses",
    title: "Payroll, treasury, and suppliers under one roof",
    description:
      "Run multi-entity payroll, treasury sweeps, and supplier payments where every transfer is identity-checked, rule-validated, and hash-chained.",
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    alt: "A finance team collaborating over laptops in a meeting room",
    stat: { value: "100%", label: "policy coverage on payouts" },
    points: [
      { icon: WalletIcon, title: "Payroll", detail: "Compliant payouts for every entity" },
      { icon: LandmarkIcon, title: "Treasury", detail: "Automated sweeps with audit trails" },
      { icon: TruckIcon, title: "Suppliers", detail: "Allowlist-only supplier payments" },
    ],
  },
  {
    kicker: "Institutions",
    title: "Compliance, governance, and auditing as code",
    description:
      "Encode policy into the platform and produce signed, immutable audit reports on demand — ready for regulators, auditors, and proof of control.",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    alt: "A modern institutional office building at dusk",
    stat: { value: "3.1s", label: "time to audit report" },
    points: [
      { icon: ScaleIcon, title: "Compliance", detail: "Deterministic rules on every action" },
      { icon: ShieldCheckIcon, title: "Governance", detail: "Granular roles and permissions" },
      { icon: FileCheck2Icon, title: "Auditing", detail: "Signed, immutable reports on demand" },
    ],
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="scroll-mt-20 py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealContainer className="mx-auto mb-16 max-w-2xl text-center">
          <RevealItem>
            <p className="mb-3 text-xs font-medium tracking-widest text-primary uppercase">
              Use cases
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for the people who move money
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="mt-4 text-base text-muted-foreground">
              Merchants, businesses, and institutions run the same verified, compliant envelope
              across every flow.
            </p>
          </RevealItem>
        </RevealContainer>

        <div className="flex flex-col gap-20">
          {personas.map((persona, i) => (
            <RevealItem key={persona.kicker}>
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <div className={cn("relative", i % 2 === 1 && "lg:order-2")}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-surface">
                    <Image
                      src={persona.image}
                      alt={persona.alt}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.35), transparent 55%)" }}
                      aria-hidden="true"
                    />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl border bg-card/90 px-4 py-3 shadow-lg backdrop-blur">
                      <p className="font-mono text-2xl font-semibold tracking-tight text-primary">
                        {persona.stat.value}
                      </p>
                      <p className="text-xs leading-tight text-muted-foreground">{persona.stat.label}</p>
                    </div>
                  </div>
                </div>

                <div className={cn(i % 2 === 1 && "lg:order-1")}>
                  <p className="mb-3 text-xs font-medium tracking-widest text-primary uppercase">
                    {persona.kicker}
                  </p>
                  <h3 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                    {persona.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    {persona.description}
                  </p>
                  <ul className="mt-8 space-y-5">
                    {persona.points.map((point) => (
                      <li key={point.title} className="flex items-start gap-3.5">
                        <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                          <point.icon className="size-4" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-medium">{point.title}</p>
                          <p className="mt-0.5 text-sm text-muted-foreground">{point.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </RevealItem>
          ))}
        </div>
      </div>
    </section>
  );
}
