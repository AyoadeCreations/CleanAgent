import Link from "next/link";
import {
  ShieldCheckIcon,
  DatabaseIcon,
  ScaleIcon,
  BotIcon,
  FileTextIcon,
  ArrowRightIcon,
} from "lucide-react";
import { RevealContainer, RevealItem } from "@/components/motion-reveal";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: ShieldCheckIcon,
    title: "Verified identities",
    subtitle:
      "Every counterparty passes Cleanverse identity verification (CVI) with on-chain attestation before a single transaction is approved.",
    stat: "15,000+",
    statLabel: "entities verified",
    accent: "text-blue-600",
    bg: "bg-blue-50",
    href: "/onboarding",
  },
  {
    icon: DatabaseIcon,
    title: "Verified assets",
    subtitle:
      "Assets are screened through Cleanverse's asset registry (CVA) so only risk-verified collateral, tokens, and receivables move through your flows.",
    stat: "100%",
    statLabel: "assets screened",
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
    href: "/dashboard",
  },
  {
    icon: BotIcon,
    title: "AI agents",
    subtitle:
      "Grant agents granular permissions and spending limits. They execute approved actions within boundaries you control.",
    stat: "0",
    statLabel: "human approvals needed",
    accent: "text-violet-600",
    bg: "bg-violet-50",
    href: "/dashboard/agents",
  },
  {
    icon: ScaleIcon,
    title: "Compliance automation",
    subtitle:
      "Express compliance as code — allowlists, caps, blocklists, and risk thresholds enforced deterministically on every execution.",
    stat: "98.6%",
    statLabel: "compliance rate",
    accent: "text-amber-600",
    bg: "bg-amber-50",
    href: "/dashboard/compliance",
  },
  {
    icon: FileTextIcon,
    title: "Audit reporting",
    subtitle:
      "Every decision is hashed and logged to an immutable audit trail, ready for regulators, auditors, and proof of control.",
    stat: "3.1s",
    statLabel: "to signed report",
    accent: "text-rose-600",
    bg: "bg-rose-50",
    href: "/dashboard/reports",
  },
];

export function Features() {
  return (
    <section id="platform" className="scroll-mt-20 py-24">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <RevealContainer className="mx-auto mb-16 max-w-2xl text-center">
          <RevealItem>
            <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Every layer of trust, automated
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              CleanFlow replaces manual KYC spreadsheets, ad-hoc approvals, and un-auditable
              treasury stacks with a single programmable layer.
            </p>
          </RevealItem>
        </RevealContainer>

        <RevealContainer className="grid gap-6 lg:grid-cols-5">
          {features.map((feature, i) => (
            <RevealItem
              key={feature.title}
              className={cn("h-full", i === 0 ? "lg:col-span-3" : "lg:col-span-2")}
            >
              <div className="group flex h-full flex-col gap-6 rounded-[24px] bg-card p-10 ring-1 ring-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(37,99,235,0.3)]">
                <span className={cn("inline-flex size-14 items-center justify-center rounded-2xl", feature.bg, feature.accent)}>
                  <feature.icon className="size-7" aria-hidden="true" />
                </span>
                <h3 className="text-2xl font-semibold tracking-tight">{feature.title}</h3>
                <p className="flex-1 text-base leading-relaxed text-muted-foreground">
                  {feature.subtitle}
                </p>
                <div className="flex items-end justify-between gap-4 border-t pt-6">
                  <div>
                    <p className={cn("font-mono text-3xl font-semibold tracking-tight", feature.accent)}>
                      {feature.stat}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.statLabel}</p>
                  </div>
                  <Link
                    href={feature.href}
                    className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                  >
                    Explore
                    <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealContainer>
      </div>
    </section>
  );
}
