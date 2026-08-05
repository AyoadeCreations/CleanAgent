"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRightIcon, ShieldCheckIcon, LandmarkIcon, CoinsIcon } from "lucide-react";

const FLOATING_CARDS = [
  {
    icon: ShieldCheckIcon,
    label: "Business verified",
    subtitle: "Ready to pay",
    stat: "Approved",
    rotate: -8,
    x: -46,
  },
  {
    icon: CoinsIcon,
    label: "Funds checked",
    subtitle: "Payment approved",
    stat: "Approved",
    rotate: 5,
    x: 0,
  },
  {
    icon: LandmarkIcon,
    label: "Payment sent",
    subtitle: "Recipient notified",
    stat: "Sent",
    rotate: 8,
    x: 46,
  },
];

const METRICS = [
  { value: "$12.4M", label: "Payments processed" },
  { value: "99.2%", label: "Payments approved" },
  { value: "15,000", label: "Verified businesses" },
  { value: "24/7", label: "Payments running" },
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
        <g fill="white" opacity="0.6">
          <ellipse cx="60" cy="300" rx="300" ry="90" />
          <ellipse cx="700" cy="330" rx="360" ry="100" />
          <ellipse cx="1360" cy="300" rx="300" ry="90" />
        </g>
      </motion.svg>
      <motion.svg
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 h-full w-[110%]"
        animate={{ x: ["-3%", "0%", "-3%"] }}
        transition={{ duration: 65, repeat: Infinity, ease: "easeInOut" }}
      >
        <g fill="white" opacity="0.4" filter="url(#b)">
          <ellipse cx="350" cy="360" rx="520" ry="110" />
          <ellipse cx="1050" cy="360" rx="520" ry="110" />
        </g>
        <defs>
          <filter id="b">
            <feGaussianBlur stdDeviation="2.5" />
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
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-56 text-white sm:pb-60">
          <div className="flex max-w-[700px] flex-col items-center text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-lime" aria-hidden="true" />
              Trusted payments for modern businesses
            </span>

            <h1 className="text-balance text-5xl font-bold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-[72px]">
              Trusted payments for modern businesses.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-[1.8] text-white/85">
              Send, receive, approve, and track payments from one secure workspace.
            </p>

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="group inline-flex items-center gap-2 rounded-full bg-lime px-7 py-[18px] text-base font-semibold text-black transition-transform hover:scale-105"
              >
                See it in action
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-full border border-white/70 px-7 py-[18px] text-base font-semibold text-white transition-transform hover:scale-105"
              >
                How it works
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-4 sm:gap-x-12">
              {METRICS.map((metric) => (
                <div key={metric.label} className="flex flex-col items-center text-center">
                  <span className="text-2xl font-semibold tracking-tight sm:text-[28px]">{metric.value}</span>
                  <span className="mt-1 text-xs font-medium uppercase tracking-wider text-white/70">
                    {metric.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* floating cards in the clouds */}
        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 flex items-end justify-center" aria-hidden="true">
          {FLOATING_CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              initial={reduceMotion ? undefined : { opacity: 0, y: 60 }}
              animate={
                reduceMotion
                  ? undefined
                  : {
                      opacity: 1,
                      y: [60, 64, 60],
                    }
              }
              transition={{
                duration: 0.7,
                delay: 0.2 + i * 0.15,
                ease: [0.22, 1, 0.36, 1],
                y: {
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.6,
                },
              }}
              style={{ rotate: card.rotate, marginLeft: card.x, marginRight: card.x, zIndex: 10 - i }}
              className="relative hidden h-[232px] w-[184px] flex-col justify-between rounded-3xl bg-white/95 p-6 text-black shadow-[0_16px_48px_rgba(0,0,0,0.18)] backdrop-blur sm:flex"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-black/5">
                  <card.icon className="size-5 text-[#2563eb]" />
                </div>
                <span className="rounded-full bg-lime/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black">
                  {card.stat}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold">{card.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <Clouds />
      </div>
    </section>
  );
}