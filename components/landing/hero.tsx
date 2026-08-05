"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { SparklesIcon, CheckCircle2Icon } from "lucide-react";
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

function MonadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="monad-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="22" height="22" rx="7" fill="url(#monad-grad)" />
      <path
        d="M7 16.5v-9h2.4l2.6 4v-4h2v9h-2.4l-2.6-4v4H7z"
        fill="#fff"
      />
      <rect x="1" y="1" width="22" height="22" rx="7" stroke="#fff" strokeOpacity="0.25" />
    </svg>
  );
}

function EthereumIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#627EEA" />
      <path d="M12 5.5l4.8 6.6-4.8 2.8-4.8-2.8L12 5.5z" fill="#fff" opacity="0.95" />
      <path d="M12 15.6v2.9l4.8-6.6L12 15.6z" fill="#fff" opacity="0.6" />
      <path d="M12 5.5v3.6L7.2 11.9 12 5.5z" fill="#fff" opacity="0.8" />
    </svg>
  );
}

/* ---------- Floating cards ---------- */

interface FloatCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  value: string;
  status: string;
  tone: "blue" | "white" | "violet" | "dark" | "green";
  rotate: number;
  className: string;
  visible: string;
}

const FLOAT_CARDS: FloatCard[] = [
  {
    id: "usdc",
    icon: <UsdcIcon className="size-4" />,
    title: "USDC Transfer",
    value: "$50,000",
    status: "Verified",
    tone: "blue",
    rotate: -7,
    className: "bottom-[168px] left-[4%]",
    visible: "sm:flex",
  },
  {
    id: "usdt",
    icon: <UsdtIcon className="size-4" />,
    title: "Supplier payment",
    value: "$12,400",
    status: "Approved",
    tone: "white",
    rotate: 5,
    className: "bottom-[58px] left-[13%]",
    visible: "md:flex",
  },
  {
    id: "monad",
    icon: <MonadIcon className="size-4" />,
    title: "Cross-chain",
    value: "$8,900",
    status: "Settled",
    tone: "violet",
    rotate: -4,
    className: "right-[13%] bottom-[58px]",
    visible: "md:flex",
  },
  {
    id: "ethereum",
    icon: <EthereumIcon className="size-4" />,
    title: "Wallet verification",
    value: "0x1a…f4",
    status: "Verified",
    tone: "white",
    rotate: 7,
    className: "right-[4%] bottom-[168px]",
    visible: "sm:flex",
  },
  {
    id: "ai",
    icon: <SparklesIcon className="size-4" />,
    title: "Autonomous workflow",
    value: "Payroll on schedule",
    status: "Running",
    tone: "dark",
    rotate: -5,
    className: "right-[30%] bottom-[168px]",
    visible: "lg:flex",
  },
  {
    id: "settlement",
    icon: <CheckCircle2Icon className="size-4" />,
    title: "Funds delivered",
    value: "$50,000",
    status: "Complete",
    tone: "green",
    rotate: 4,
    className: "left-[30%] bottom-[58px]",
    visible: "lg:flex",
  },
];

const TONE_CLASSES: Record<FloatCard["tone"], string> = {
  blue: "bg-gradient-to-br from-[#2f83da] to-[#1c4d8f] text-white border-white/20",
  white: "bg-white text-foreground border-white/60",
  violet: "bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] text-white border-white/20",
  dark: "bg-[#0b1020] text-white border-white/10",
  green: "bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-white/20",
};

const STATUS_CLASSES: Record<FloatCard["status"], string> = {
  Verified: "bg-lime text-black",
  Approved: "bg-emerald-500 text-white",
  Settled: "bg-white/20 text-white",
  Running: "bg-lime text-black",
  Complete: "bg-white/20 text-white",
};

function FloatCard({ card, reduce }: { card: FloatCard; reduce: boolean }) {
  const Icon = card.icon;
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
        delay: 0.3 + parseFloat(card.id.length.toString()) * 0.05,
        ease: [0.22, 1, 0.36, 1],
        y: {
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: (card.id.length % 3) * 0.7,
        },
      }}
      style={{ rotate: card.rotate, boxShadow: "0 40px 80px rgba(0,0,0,0.12)" }}
      className={cn(
        "pointer-events-none absolute z-20 hidden w-[172px] flex-col rounded-3xl border p-3.5 backdrop-blur-[20px]",
        card.visible,
        TONE_CLASSES[card.tone],
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-xl",
            card.tone === "white" ? "bg-muted" : "bg-white/20",
          )}
        >
          {Icon}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
            STATUS_CLASSES[card.status],
          )}
        >
          {card.status}
        </span>
      </div>
      <div className="mt-2.5">
        <p className={cn("text-[10px] uppercase tracking-wider", card.tone === "white" ? "text-muted-foreground" : "text-white/70")}>
          {card.title}
        </p>
        <p className="mt-0.5 truncate font-mono text-base font-semibold tracking-tight">{card.value}</p>
      </div>
    </motion.div>
  );
}

/* ---------- Clouds ---------- */

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

/* ---------- Hero ---------- */

const METRICS = [
  { value: "$12.4M", label: "Payments processed" },
  { value: "99.2%", label: "Payments approved" },
  { value: "15,000", label: "Verified businesses" },
  { value: "24/7", label: "Payments running" },
];

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="mx-auto w-full max-w-[1440px] px-8 py-12">
      <div className="relative h-[820px] overflow-hidden rounded-[40px] bg-gradient-to-b from-[#0a79d8] to-[#18a6ff]">
        {/* light bloom */}
        <div
          className="pointer-events-none absolute -top-1/4 left-1/2 h-[80%] w-[80%] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.55), transparent 65%)" }}
          aria-hidden="true"
        />

        {/* centered content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-56 text-white sm:pb-56">
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
              <DemoButton className="px-7 py-[18px] text-base" />
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

        {/* floating cards */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[300px] z-10">
          {FLOAT_CARDS.map((card) => (
            <FloatCard key={card.id} card={card} reduce={Boolean(reduceMotion)} />
          ))}
        </div>

        <Clouds />
      </div>
    </section>
  );
}
