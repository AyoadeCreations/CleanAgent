import Image from "next/image";
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

export function Features() {
  return (
    <section id="platform" className="scroll-mt-20 py-24">
      <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-12">
        <RevealContainer className="mb-16 max-w-2xl">
          <RevealItem>
            <h2 className="text-balance text-4xl font-bold tracking-[-0.03em] sm:text-5xl lg:text-[64px] lg:leading-[1.05]">
              Trust built into every payment
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="mt-6 max-w-xl text-lg leading-[1.8] text-muted-foreground">
              We replace manual spreadsheets, approval queues, and paper trails with one simple,
              secure workspace for your money.
            </p>
          </RevealItem>
        </RevealContainer>

        <RevealContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Large card — verified identities (blue, photo) */}
          <RevealItem className="md:col-span-2 lg:col-span-1 lg:row-span-2 lg:h-[450px]">
            <div className="group flex h-full flex-col justify-between overflow-hidden rounded-[24px] bg-gradient-to-b from-[#3da7ff] to-[#2784e0] p-8 text-white transition-transform duration-300 hover:-translate-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                  <ShieldCheckIcon className="size-6" />
                </span>
                <span className="font-mono text-sm font-semibold tracking-tight">15,000+</span>
              </div>

              <div className="relative my-6 aspect-[4/3] w-full overflow-hidden rounded-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80"
                  alt="Team reviewing identity verification on a laptop"
                  fill
                  sizes="(min-width: 1024px) 30vw, 100vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>

              <div>
                <h3 className="text-2xl font-semibold tracking-tight">Verified businesses</h3>
                <p className="mt-2 text-base leading-relaxed text-white/85">
                  Every business you pay is verified before the first transaction, so you only
                  ever send money to who you mean to.
                </p>
                <Link
                  href="/onboarding"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white transition-transform group-hover:translate-x-0.5"
                >
                  Learn more
                  <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            </div>
          </RevealItem>

          {/* Medium gray card — verified assets */}
          <RevealItem className="lg:col-span-1">
            <div className="group flex h-full flex-col justify-between rounded-[24px] bg-[#f8f8f8] p-8 transition-transform duration-300 hover:-translate-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white ring-1 ring-black/[0.06]">
                    <DatabaseIcon className="size-6 text-[#2563eb]" />
                  </span>
                  <span className="font-mono text-2xl font-semibold tracking-tight text-foreground">100%</span>
                </div>
                <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80"
                    alt="Asset portfolio dashboard"
                    fill
                    sizes="(min-width: 1024px) 30vw, 100vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="mt-6">
                  <h3 className="text-2xl font-semibold tracking-tight">Protected payments</h3>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Every payment is screened against fraud and sanctions before it moves — only
                    safe, approved funds flow through your account.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563eb] transition-transform group-hover:translate-x-0.5"
              >
                Explore payments
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </RevealItem>

          {/* Lime card — AI agents */}
          <RevealItem className="lg:col-span-1">
            <div className="group flex h-full flex-col justify-between rounded-[24px] bg-lime p-8 text-black transition-transform duration-300 hover:-translate-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-black/10">
                    <BotIcon className="size-6" />
                  </span>
                  <span className="font-mono text-2xl font-semibold tracking-tight">0 approvals</span>
                </div>
                <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80"
                    alt="Autonomous agent interface"
                    fill
                    sizes="(min-width: 1024px) 30vw, 100vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="mt-6">
                  <h3 className="text-2xl font-semibold tracking-tight">Payment automations</h3>
                  <p className="mt-2 text-base leading-relaxed text-black/70">
                    Automate recurring payments within limits you set. They run on schedule, and
                    you stay in control.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/agents"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-black transition-transform group-hover:translate-x-0.5"
              >
                Create an automation
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </RevealItem>

          {/* Black card — compliance automation */}
          <RevealItem className="lg:col-span-1">
            <div className="group flex h-full flex-col justify-between rounded-[24px] bg-[#111111] p-8 text-white transition-transform duration-300 hover:-translate-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/10">
                    <ScaleIcon className="size-6" />
                  </span>
                  <span className="font-mono text-2xl font-semibold tracking-tight">98.6%</span>
                </div>
                <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80"
                    alt="Team reviewing compliance policy"
                    fill
                    sizes="(min-width: 1024px) 30vw, 100vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="mt-6">
                  <h3 className="text-2xl font-semibold tracking-tight">Account safety</h3>
                  <p className="mt-2 text-base leading-relaxed text-white/70">
                    Account rules, limits, and safety checks are applied to every payment
                    automatically — consistent, every time.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/compliance"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white transition-transform group-hover:translate-x-0.5"
              >
                View account health
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </RevealItem>

          {/* Small gray card — audit reporting */}
          <RevealItem className="lg:col-span-1">
            <div className="group flex h-full flex-col justify-between rounded-[24px] bg-[#f8f8f8] p-8 transition-transform duration-300 hover:-translate-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white ring-1 ring-black/[0.06]">
                    <FileTextIcon className="size-6 text-[#2563eb]" />
                  </span>
                  <span className="font-mono text-2xl font-semibold tracking-tight">3.1s</span>
                </div>
                <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80"
                    alt="Signed audit report document"
                    fill
                    sizes="(min-width: 1024px) 30vw, 100vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="mt-6">
                  <h3 className="text-2xl font-semibold tracking-tight">Activity records</h3>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Every payment leaves a clear, shareable record — ready for your accountant
                    or auditor whenever you need it.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/reports"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563eb] transition-transform group-hover:translate-x-0.5"
              >
                View activity
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </RevealItem>
        </RevealContainer>
      </div>
    </section>
  );
}
