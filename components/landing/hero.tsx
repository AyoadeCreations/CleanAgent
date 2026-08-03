"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRightIcon, ShieldCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HeroVisual = dynamic(() => import("./hero-visual").then((m) => m.HeroVisual), {
  loading: () => (
    <div className="h-[460px] w-full max-w-md animate-pulse rounded-2xl border bg-card/60" />
  ),
});

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
            "radial-gradient(55% 45% at 20% 0%, oklch(0.62 0.2 255 / 0.14), transparent 70%), linear-gradient(to bottom, transparent, var(--background))",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.3]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(65% 60% at 30% 15%, black, transparent)",
        }}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:flex-row lg:items-start lg:gap-16 lg:px-8 lg:pt-28">
        <div className="w-full max-w-xl text-center lg:text-left">
          <motion.div
            variants={fade}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            className="mb-6 flex justify-center lg:justify-start"
          >
            <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs">
              <ShieldCheckIcon className="size-3.5 text-primary" />
              Built on Cleanverse infrastructure
            </Badge>
          </motion.div>

          <motion.h1
            variants={fade}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.1]"
          >
            Trust infrastructure for the{" "}
            <span className="text-primary">programmable economy</span>.
          </motion.h1>

          <motion.p
            variants={fade}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground"
          >
            CleanFlow combines verified identities, verified assets, intelligent agents,
            compliance automation, and real-time settlement into one platform.
          </motion.p>

          <motion.div
            variants={fade}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
          >
            <Button size="lg" render={<Link href="/demo" />}>
              Start Demo
              <ArrowRightIcon className="size-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="#platform" />}>
              Explore Platform
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-full flex-1 lg:flex lg:justify-center"
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}
