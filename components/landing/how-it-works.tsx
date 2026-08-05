import {
  ShieldCheckIcon,
  SendIcon,
  EyeIcon,
  BadgeCheckIcon,
  FileBarChart2Icon,
} from "lucide-react";
import { RevealContainer, RevealItem } from "@/components/motion-reveal";

const steps = [
  {
    icon: ShieldCheckIcon,
    title: "Verify your business",
    description:
      "Complete a quick verification once. Your business stays verified, so every payment you make is trusted from day one.",
  },
  {
    icon: SendIcon,
    title: "Create a payment",
    description:
      "Send money to suppliers, team, or partners in minutes. Pick an amount and a recipient — nothing more.",
  },
  {
    icon: EyeIcon,
    title: "Review the transaction",
    description:
      "We automatically check every payment for fraud, sanctions, and errors before any money moves.",
  },
  {
    icon: BadgeCheckIcon,
    title: "Approve the payment",
    description:
      "Give the go-ahead from your phone or desktop. Only you decide what leaves your account.",
  },
  {
    icon: FileBarChart2Icon,
    title: "Download the report",
    description:
      "Get a clean, shareable record of every payment — ready for your accountant, auditor, or records.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealContainer className="mx-auto mb-16 max-w-2xl text-center">
          <RevealItem>
            <p className="mb-3 text-xs font-medium tracking-widest text-primary uppercase">
              How it works
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Five steps. That&apos;s it.
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="mt-4 text-base text-muted-foreground">
              From first payment to clean records — without the paperwork, queues, or guesswork.
            </p>
          </RevealItem>
        </RevealContainer>

        <RevealContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, i) => (
            <RevealItem key={step.title} className="h-full">
              <div className="relative flex h-full flex-col rounded-2xl border bg-card p-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <step.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-sm font-semibold text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealContainer>
      </div>
    </section>
  );
}
