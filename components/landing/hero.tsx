"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroVisual = dynamic(() => import("./hero-visual").then((m) => m.HeroVisual), {
  loading: () => <div className="h-[440px] w-full animate-pulse rounded-[24px] border bg-surface" />,
});

const METRICS = [
  { value: "$12.4M", label: "settled" },
  { value: "98.6%", label: "compliance rate" },
  { value: "15,000", label: "verified entities" },
  { value: "8", label: "networks" },
];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const fade: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(55% 45% at 70% 0%, oklch(0.55 0.2 255 / 0.08), transparent 70%), radial-gradient(45% 40% at 15% 10%, oklch(0.85 0.15 150 / 0.12), transparent 70%)",
        }}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-24 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <motion.div variants={fade} initial={reduceMotion ? false : "hidden"} animate="visible" className="w-full max-w-3xl text-center">
          <motion.div variants={fade} className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              Trust infrastructure for the programmable economy
            </span>
          </motion.div>

          <motion.h1
            variants={fade}
            className="text-balance text-5xl font-bold tracking-[-0.04em] text-foreground sm:text-6xl lg:text-[72px] lg:leading-[1.05]"
          >
            Payments that verify before they settle.
          </motion.h1>

          <motion.p
            variants={fade}
            className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-[1.8] text-muted-foreground"
          >
            CleanFlow combines verified identities, verified assets, intelligent agents,
            compliance automation, and real-time settlement into one platform.
          </motion.p>

          <motion.div
            variants={fade}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button size="lg" render={<Link href="/demo" />}>
              Start demo
              <ArrowRightIcon className="size-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="#platform" />}>
              Explore platform
            </Button>
          </motion.div>

          <motion.dl
            variants={fade}
            className="mt-16 grid grid-cols-2 gap-8 border-t pt-10 sm:grid-cols-4"
          >
            {METRICS.map((m) => (
              <div key={m.label} className="flex flex-col items-center gap-1 text-center">
                <dt className="order-last text-sm text-muted-foreground">{m.label}</dt>
                <dd className="font-mono text-3xl font-semibold tracking-tight text-foreground">
                  {m.value}
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 w-full"
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}
