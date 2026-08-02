"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRightIcon, PlayCircleIcon, ShieldCheckIcon, FingerprintIcon, CoinsIcon, ActivityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Identity checks", value: "5.2M+" },
  { label: "Transactions orchestrated", value: "$940M" },
  { label: "Zero fraud losses", value: "99.98%" },
  { label: "Compliance automation", value: "100%" },
];

const pillars = [
  { icon: FingerprintIcon, label: "CVI · Verified identity" },
  { icon: CoinsIcon, label: "CVA · Verified assets" },
  { icon: ActivityIcon, label: "CCP · Compliance" },
  { icon: ShieldCheckIcon, label: "Immutable audit" },
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
            "radial-gradient(60% 50% at 50% 0%, oklch(0.7 0.14 165 / 0.14), transparent 70%), linear-gradient(to bottom, transparent, var(--background))",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(70% 60% at 50% 20%, black, transparent)",
        }}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28 lg:px-8">
        <motion.div
          variants={fade}
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          className="mb-6"
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
          className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
        >
          Trust Every
          <span className="bg-gradient-to-r from-primary via-teal-400 to-emerald-300 bg-clip-text text-transparent">
            {" "}
            Transaction
          </span>
        </motion.h1>

        <motion.p
          variants={fade}
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground"
        >
          Verified identity, verified assets, programmable compliance, autonomous execution, and
          immutable audit trails.
        </motion.p>

        <motion.div
          variants={fade}
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button size="lg" render={<Link href="/register" />}>
            Start building
            <ArrowRightIcon className="size-4" />
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/login" />}>
            <PlayCircleIcon className="size-4" />
            View demonstration
          </Button>
        </motion.div>

        <motion.div
          variants={fade}
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          className="mt-16 w-full"
        >
          <div className="mx-auto mb-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {pillars.map((p) => (
              <div key={p.label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <p.icon className="size-4 text-primary" aria-hidden="true" />
                {p.label}
              </div>
            ))}
          </div>

          <dl className="mx-auto grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1 bg-card px-5 py-5">
                <dd className="order-first font-mono text-xl font-semibold tracking-tight sm:text-2xl">
                  {stat.value}
                </dd>
                <dt className="text-xs text-muted-foreground">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  );
}
