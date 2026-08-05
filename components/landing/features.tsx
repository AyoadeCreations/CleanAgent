import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheckIcon,
  ShieldCheckIcon,
  BotIcon,
  GlobeIcon,
  ZapIcon,
  FileBarChart2Icon,
  ArrowUpRightIcon,
} from "lucide-react";
import { RevealContainer, RevealItem } from "@/components/motion-reveal";
import { cn } from "@/lib/utils";

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  image: string;
  imageAlt: string;
  position: string;
  title: string;
  description: string;
  cta: { label: string; href: string };
}

const FEATURES: Feature[] = [
  {
    icon: BadgeCheckIcon,
    label: "Identity",
    image: "/dashboard.png",
    imageAlt: "CleanFlow dashboard showing verified businesses",
    position: "object-left",
    title: "Business verification",
    description: "Confirm the identity of every company before payments are approved.",
    cta: { label: "See it in action", href: "/demo" },
  },
  {
    icon: ShieldCheckIcon,
    label: "Safety",
    image: "/dashboard.png",
    imageAlt: "CleanFlow payment protection checks",
    position: "object-center",
    title: "Payment protection",
    description: "Protect transfers using automated verification checks.",
    cta: { label: "See it in action", href: "/demo" },
  },
  {
    icon: BotIcon,
    label: "Automation",
    image: "/dashboard.png",
    imageAlt: "CleanFlow automation workflow",
    position: "object-right",
    title: "AI automations",
    description: "Create intelligent workflows that operate inside predefined rules.",
    cta: { label: "See it in action", href: "/demo" },
  },
  {
    icon: GlobeIcon,
    label: "Network",
    image: "/dashboard.png",
    imageAlt: "CleanFlow cross-border payments",
    position: "object-left",
    title: "Cross-border payments",
    description: "Move money internationally in real time.",
    cta: { label: "See it in action", href: "/demo" },
  },
  {
    icon: ZapIcon,
    label: "Speed",
    image: "/dashboard.png",
    imageAlt: "CleanFlow instant settlement",
    position: "object-center",
    title: "Instant settlement",
    description: "Complete transactions within seconds.",
    cta: { label: "See it in action", href: "/demo" },
  },
  {
    icon: FileBarChart2Icon,
    label: "Records",
    image: "/dashboard.png",
    imageAlt: "CleanFlow activity history",
    position: "object-right",
    title: "Activity history",
    description: "Track every payment from beginning to end.",
    cta: { label: "See it in action", href: "/demo" },
  },
];

export function Features() {
  return (
    <section id="platform" className="scroll-mt-20 py-[120px]">
      <div className="mx-auto w-full max-w-[1440px] px-8">
        <RevealContainer className="mx-auto mb-16 max-w-3xl text-center">
          <RevealItem>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              The platform
            </p>
          </RevealItem>
          <RevealItem>
            <h2 className="text-balance text-4xl font-bold tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              Everything a modern business needs to move money
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-[1.8] text-muted-foreground">
              One secure workspace for sending, checking, approving, and tracking every payment.
            </p>
          </RevealItem>
        </RevealContainer>

        <RevealContainer className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <RevealItem key={feature.title} className="h-full">
                <div className="group flex h-full flex-col overflow-hidden rounded-[32px] bg-card p-8 shadow-[0_30px_80px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_40px_100px_rgba(0,0,0,0.12)]">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {feature.label}
                    </span>
                  </div>

                  <div className="relative mt-6 aspect-[16/10] w-full overflow-hidden rounded-2xl ring-1 ring-border/60">
                    <Image
                      src={feature.image}
                      alt={feature.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 30vw, 100vw"
                      className={cn("object-cover transition-transform duration-500 group-hover:scale-105", feature.position)}
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
                      className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-full border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary"
                    >
                      {feature.cta.label}
                      <ArrowUpRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
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
