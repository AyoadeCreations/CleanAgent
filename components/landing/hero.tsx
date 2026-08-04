"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRightIcon, ShieldCheckIcon, LandmarkIcon, CoinsIcon } from "lucide-react";

const FLOATING_CARDS = [
  { icon: ShieldCheckIcon, label: "Identity verified", value: "CVI · on-chain", rotate: -8 },
  { icon: CoinsIcon, label: "Assets screened", value: "CVA · risk-checked", rotate: 5 },
  { icon: LandmarkIcon, label: "Settlement", value: "real-time", rotate: 8 },
];

function Clouds() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 overflow-hidden" aria-hidden="true">
      <motion.svg
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 h-full w-[110%]"
        animate={{ x: ["0%", "-6%", "0%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      >
        <g fill="white" opacity="0.9">
          <ellipse cx="-60" cy="300" rx="420" ry="120" />
          <ellipse cx="220" cy="260" rx="360" ry="100" />
          <ellipse cx="520" cy="320" rx="500" ry="130" />
          <ellipse cx="900" cy="270" rx="420" ry="110" />
          <ellipse cx="1240" cy="320" rx="460" ry="120" />
          <ellipse cx="1540" cy="280" rx="380" ry="100" />
        </g>
      </motion.svg>
      <motion.svg
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 h-full w-[110%]"
        animate={{ x: ["3%", "0%", "3%"] }}
        transition={{ duration: 55, repeat: Infinity, ease: "easeInOut" }}
      >
        <g fill="white" opacity="0.55" filter="url(#b)">
          <ellipse cx="80" cy="340" rx="440" ry="120" />
          <ellipse cx="600" cy="300" rx="460" ry="110" />
          <ellipse cx="1180" cy="340" rx="430" ry="120" />
        </g>
        <defs>
          <filter id="b">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
      </motion.svg>
    </div>
  );
}

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 py-12 lg:px-12">
      <div className="relative h-[760px] overflow-hidden rounded-[32px] bg-gradient-to-b from-[#0a79d8] to-[#18a6ff]">
        {/* light bloom */}
        <div
          className="pointer-events-none absolute -top-1/4 left-1/2 h-[80%] w-[80%] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.55), transparent 65%)" }}
          aria-hidden="true"
        />

        {/* centered content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-white">
          <div className="flex max-w-[700px] flex-col items-center text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-lime" aria-hidden="true" />
              Trust infrastructure for the programmable economy
            </span>

            <h1 className="text-balance text-5xl font-bold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-[72px]">
              Payments that verify before they settle.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-[1.8] text-white/85">
              CleanFlow combines verified identities, verified assets, autonomous agents,
              compliance, and real-time settlement into one platform.
            </p>

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="group inline-flex items-center gap-2 rounded-full bg-lime px-7 py-[18px] text-base font-semibold text-black transition-transform hover:scale-105"
              >
                Start demo
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#platform"
                className="inline-flex items-center gap-2 rounded-full border border-white/70 px-7 py-[18px] text-base font-semibold text-white transition-transform hover:scale-105"
              >
                Explore platform
              </Link>
            </div>
          </div>
        </div>

        {/* floating cards in the clouds */}
        <div className="pointer-events-none absolute inset-x-0 bottom-10 flex items-end justify-center gap-5" aria-hidden="true">
          {FLOATING_CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              initial={reduceMotion ? undefined : { opacity: 0, y: 40 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              style={{ rotate: card.rotate, zIndex: 10 - i }}
              className="relative hidden h-[220px] w-[180px] flex-col justify-between rounded-3xl bg-white/95 p-6 text-black shadow-[0_16px_48px_rgba(0,0,0,0.18)] backdrop-blur sm:flex"
            >
              <div className="flex size-10 items-center justify-center rounded-2xl bg-black/5">
                <card.icon className="size-5 text-[#2563eb]" />
              </div>
              <div>
                <p className="text-sm font-semibold">{card.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <Clouds />
      </div>
    </section>
  );
}