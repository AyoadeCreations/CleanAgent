import { cn } from "@/lib/utils";

/**
 * Brand mark — a verified-flow glyph: a trust ring with a flowing check.
 * Combines identity, verification, flow, and settlement in one mark.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(2,6,23,0.4)]",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-4.5">
        <path
          d="M12 2.8A9.2 9.2 0 1 0 21.2 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.45"
        />
        <path
          d="M6.8 12.6l3.4 3.4 7-7.9"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.6 3.2v3.4m0 0h3.4m-3.4 0l3-3"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
      </svg>
    </span>
  );
}

/** Monochrome mark — renders in currentColor with no tile, for low-contrast contexts. */
export function LogoMarkMono({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("size-6", className)} aria-hidden="true">
      <path
        d="M12 2.8A9.2 9.2 0 1 0 21.2 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M6.8 12.6l3.4 3.4 7-7.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.6 3.2v3.4m0 0h3.4m-3.4 0l3-3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  monochrome = false,
  inverse = false,
}: {
  className?: string;
  markClassName?: string;
  monochrome?: boolean;
  inverse?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {monochrome ? <LogoMarkMono className={markClassName} /> : <LogoMark className={markClassName} />}
      <span
        className={cn(
          "font-heading text-base font-semibold tracking-tight",
          inverse ? "text-white" : "text-foreground",
        )}
      >
        Clean<span className={inverse ? "text-white/90" : "text-primary"}>Flow</span>
      </span>
    </span>
  );
}
