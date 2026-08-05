import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheckIcon,
  ScaleIcon,
  BotIcon,
  GlobeIcon,
  ZapIcon,
  FileBarChart2Icon,
  ArrowUpRightIcon,
} from "lucide-react";
import { RevealContainer, RevealItem } from "@/components/motion-reveal";

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  cta: { label: string; href: string };
}

const FEATURES: Feature[] = [
  {
    icon: ShieldCheckIcon,
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Team verifying a business on a laptop",
    title: "Business verification",
    description:
      "Verify your business once. After that, every payment you send carries your verified status — no repeated paperwork.",
    cta: { label: "Verify your business", href: "/onboarding" },
  },
  {
    icon: ScaleIcon,
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Payment protection dashboard",
    title: "Payment protection",
    description:
      "Every payment is checked for fraud and sanctions before it moves. Only safe, approved funds leave your account.",
    cta: { label: "Explore payments", href: "/dashboard" },
  },
  {
    icon: BotIcon,
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Autonomous payment automation",
    title: "AI automations",
    description:
      "Set the limits, then let automations run payroll and supplier payments on schedule — you stay in control.",
    cta: { label: "Create an automation", href: "/dashboard/agents" },
  },
  {
    icon: GlobeIcon,
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Cross-border payment network",
    title: "Cross-border payments",
    description:
      "Pay suppliers and partners anywhere in the world without bank queues, high fees, or international friction.",
    cta: { label: "Send a payment", href: "/dashboard/transactions" },
  },
  {
    icon: ZapIcon,
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Instant settlement speed",
    title: "Instant settlement",
    description:
      "Payments move in minutes, not days. Once approved, funds are delivered to your recipient right away.",
    cta: { label: "See it in action", href: "/demo" },
  },
  {
    icon: FileBarChart2Icon,
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Activity records document",
    title: "Activity history",
    description:
      "Every payment leaves a clean, shareable record — ready for your accountant, auditor, or your own books.",
    cta: { label: "View activity", href: "/dashboard/reports" },
  },
];

export function Features() {
  return (
    <section id="platform" className="scroll-mt-20 py-24">
      <div className="mx-auto w-full max-w-[1440px] px-8">
        <RevealContainer className="mb-16 max-w-2xl">
          <RevealItem>
            <h2 className="text-balance text-4xl font-bold tracking-[-0.03em] sm:text-5xl lg:text-[64px] lg:leading-[1.05]">
              Everything a modern business needs to move money
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="mt-6 max-w-xl text-lg leading-[1.8] text-muted-foreground">
              One secure workspace for sending, checking, approving, and tracking every payment.
            </p>
          </RevealItem>
        </RevealContainer>

        <RevealContainer className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <RevealItem key={feature.title} className="h-full">
                <div className="group flex h-full flex-col overflow-hidden rounded-[32px] bg-card p-8 shadow-[0_30px_80px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_40px_100px_rgba(0,0,0,0.12)]">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                  </div>

                  <div className="relative mt-6 aspect-[16/10] w-full overflow-hidden rounded-2xl">
                    <Image
                      src={feature.image}
                      alt={feature.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 30vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <div className="mt-6 flex flex-1 flex-col">
                    <h3 className="text-xl font-semibold tracking-tight">{feature.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                    <Link
                      href={feature.cta.href}
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                    >
                      {feature.cta.label}
                      <ArrowUpRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </div>
                </div>
              </RevealItem>
            );
          })}
        </RevealContainer>
      </div>
    </section>
  );
}
