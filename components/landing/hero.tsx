"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  SparklesIcon,
  ArrowRightIcon,
  BadgeCheckIcon,
  BotIcon,
  CheckCircle2Icon,
} from "lucide-react";
import { DemoButton } from "@/components/landing/demo-button";
import { cn } from "@/lib/utils";

/* ---------- Token glyphs (inline SVG, brand-accurate enough) ---------- */

function UsdcIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#2775CA" />
      <circle cx="12" cy="12" r="9.2" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" />
      <path
        d="M12 7.2v9.6M14.6 9.6c-.3-1.2-1.3-1.9-2.6-1.9-1.5 0-2.6.8-2.6 2.1 0 2.8 5.2 1.4 5.2 4.2 0 1.3-1.1 2.1-2.6 2.1-1.3 0-2.3-.7-2.6-1.9"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UsdtIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#26A17B" />
      <path d="M13.4 10.4V8.6h5.2V5.4H5.4v3.2h5.2v1.8c-4.2.2-7.3 1-7.3 2 0 1 3.1 1.8 7.3 2v6.4h1.6v-6.4c4.2-.2 7.3-1 7.3-2 0-1-3.1-1.8-7.3-2z" fill="#fff" />
    </svg>
  );
}

/* ---------- Floating cards ---------- */

interface FloatCard {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  status: string;
  statusTone: string;
  rotate: number;
  className: string;
  visible: string;
}

const STATUS_TONES: Record<string, string> = {
  Approved: "bg-lime text-black",
  Completed: "bg-emerald-500 text-white",
  Delivered: "bg-sky-500 text-white",
  Verified: "bg-lime text-black",
  Running: "bg-violet-500 text-white",
  Success: "bg-emerald-500 text-white",
};

const FLOAT_CARDS: FloatCard[] = [
  {
    id: "usdc",
    icon: <UsdcIcon className="size-5" />,
    label: "USDC transfer",
    value: "$50,000",
    status: "Approved",
    statusTone: STATUS_TONES.Approved,
    rotate: -7,
    className: "left-[3%] top-[8%]",
    visible: "lg:flex",
  },
  {
    id: "usdt",
    icon: <UsdtIcon className="size-5" />,
    label: "USDT payment",
    value: "$12,400",
    status: "Completed",
    statusTone: STATUS_TONES.Completed,
    rotate: 5,
    className: "left-[3%] bottom-[4%]",
    visible: "xl:flex",
  },
  {
    id: "supplier",
    icon: <CheckCircle2Icon className="size-5 text-emerald-600" />,
    label: "Supplier payout",
    value: "$8,900",
    status: "Delivered",
    statusTone: STATUS_TONES.Delivered,
    rotate: -3,
    className: "left-[2%] top-[62%]",
    visible: "lg:flex",
  },
  {
    id: "verification",
    icon: <BadgeCheckIcon className="size-5 text-blue-600" />,
    label: "Business verification",
    value: "Acme Inc.",
    status: "Verified",
    statusTone: STATUS_TONES.Verified,
    rotate: 5,
    className: "right-[3%] top-[8%]",
    visible: "lg:flex",
  },
  {
    id: "automation",
    icon: <BotIcon className="size-5 text-violet-600" />,
    label: "Automation workflow",
    value: "Payroll · on schedule",
    status: "Running",
    statusTone: STATUS_TONES.Running,
    rotate: -7,
    className: "right-[2%] top-[62%]",
    visible: "lg:flex",
  },
  {
    id: "settlement",
    icon: <CheckCircle2Icon className="size-5 text-emerald-600" />,
    label: "Settlement completed",
    value: "$50,000",
    status: "Success",
    statusTone: STATUS_TONES.Success,
    rotate: -3,
    className: "right-[3%] bottom-[4%]",
    visible: "xl:flex",
  },
];

function FloatCard({ card, reduce }: { card: FloatCard; reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 24 }}
      animate={
        reduce
          ? undefined
          : {
              opacity: 1,
              y: [0, -9, 0],
            }
      }
      transition={{
        duration: 0.7,
        delay: 0.4 + (card.id.length % 4) * 0.06,
        ease: [0.22, 1, 0.36, 1],
        y: {
          duration: 5 + (card.id.length % 3) * 1.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: (card.id.length % 3) * 0.8,
        },
      }}
      style={{ rotate: card.rotate, boxShadow: "0 30px 80px rgba(0,0,0,0.12)" }}
      className={cn(
        "pointer-events-none absolute z-20 hidden w-[180px] flex-col gap-3 rounded-3xl border border-white/60 bg-white/70 p-4 text-foreground backdrop-blur-[20px]",
        card.visible,
        card.className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-xl bg-white shadow-sm">
          {card.icon}
        </span>
        <span className={cn("rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide", card.statusTone)}>
          {card.status}
        </span>
      </div>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{card.label}</p>
        <p className="mt-0.5 truncate font-mono text-lg font-semibold tracking-tight">{card.value}</p>
      </div>
    </motion.div>
  );
}

/* ---------- Clouds ---------- */

function Clouds({ reduce }: { reduce: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] overflow-hidden" aria-hidden="true">
      {/* back layer — softest, slowest parallax */}
      <motion.svg
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 h-full w-[120%]"
        style={{ filter: "blur(10px)", opacity: 0.8 }}
        animate={reduce ? undefined : { x: ["-5%", "5%", "-5%"] }}
        transition={{ duration: 60, repeat: Infinity, ease: "easeInOut" }}
      >
        <g fill="#ffffff">
          <ellipse cx="120" cy="330" rx="480" ry="130" />
          <ellipse cx="980" cy="340" rx="540" ry="150" />
          <ellipse cx="1680" cy="360" rx="430" ry="120" />
        </g>
      </motion.svg>

      {/* mid layer — medium blur, medium parallax */}
      <motion.svg
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 h-full w-[115%]"
        style={{ filter: "blur(6px)", opacity: 0.6 }}
        animate={reduce ? undefined : { x: ["4%", "-4%", "4%"] }}
        transition={{ duration: 48, repeat: Infinity, ease: "easeInOut" }}
      >
        <g fill="#ffffff">
          <ellipse cx="-140" cy="330" rx="420" ry="110" />
          <ellipse cx="560" cy="360" rx="500" ry="120" />
          <ellipse cx="1280" cy="340" rx="460" ry="120" />
        </g>
      </motion.svg>

      {/* front layer — crisp, fastest parallax */}
      <motion.svg
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 h-full w-[112%]"
        style={{ opacity: 0.95 }}
        animate={reduce ? undefined : { x: ["-3%", "3%", "-3%"] }}
        transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
      >
        <g fill="#ffffff">
          <ellipse cx="-60" cy="330" rx="360" ry="105" />
          <ellipse cx="420" cy="360" rx="440" ry="115" />
          <ellipse cx="960" cy="350" rx="400" ry="110" />
          <ellipse cx="1440" cy="350" rx="380" ry="105" />
        </g>
      </motion.svg>
    </div>
  );
}

/* ---------- Hero ---------- */

const METRICS = [
  { value: "$12.4M", label: "Settled volume" },
  { value: "98.6%", label: "Success rate" },
  { value: "15,000", label: "Verified businesses" },
  { value: "8", label: "Supported networks" },
];

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="pt-20">
      <div className="mx-auto w-full max-w-[1440px] px-8">
        <div className="relative overflow-hidden rounded-[40px] bg-[linear-gradient(135deg,#1d7df2,#2e8cff,#5da8ff)]">
          {/* light bloom */}
          <div
            className="pointer-events-none absolute -top-1/3 left-1/2 h-[85%] w-[85%] -translate-x-1/2 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.45), transparent 62%)" }}
            aria-hidden="true"
          />

          {/* centered content */}
          <div className="relative z-10 mx-auto flex w-full max-w-[880px] flex-col items-center px-6 py-24 text-center text-white sm:px-12 lg:py-28">
            <Link
              href="#platform"
              className="group inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <SparklesIcon className="size-3.5 text-lime-300" aria-hidden="true" />
              New — AI automations for payroll &amp; suppliers
              <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>

            <h1 className="mt-8 text-balance text-[clamp(4rem,7vw,7rem)] font-bold leading-none tracking-[-0.04em]">
              Payments that verify before they settle.
            </h1>

            <p className="mt-7 max-w-xl text-[1.2rem] leading-[1.8] text-white/85">
              Move money confidently across borders with built-in business verification, payment
              protection, and intelligent automation.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
              <DemoButton label="Start demo" className="px-8 py-4 text-base" />
              <Link
                href="#platform"
                className="group inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                Explore platform
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-16 grid w-full max-w-2xl grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 sm:divide-x sm:divide-white/15">
              {METRICS.map((metric) => (
                <div key={metric.label} className="flex flex-col items-center text-center">
                  <span className="text-3xl font-semibold tracking-tight sm:text-[32px]">{metric.value}</span>
                  <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70 sm:text-xs">
                    {metric.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* floating cards */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 top-0 z-10">
            {FLOAT_CARDS.map((card) => (
              <FloatCard key={card.id} card={card} reduce={Boolean(reduceMotion)} />
            ))}
          </div>

          <Clouds reduce={Boolean(reduceMotion)} />
        </div>
      </div>
    </section>
  );
}
