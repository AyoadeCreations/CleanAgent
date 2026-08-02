import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-4.5">
        <path
          d="M12 3l6.5 2.5v5.2c0 4.1-2.6 7.6-6.5 9.3-3.9-1.7-6.5-5.2-6.5-9.3V5.5L12 3z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M8.8 11.8l2.2 2.2 4.2-4.4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markClassName} />
      <span className="font-heading text-base font-semibold tracking-tight">
        Clean<span className="text-primary">Flow</span>
      </span>
    </span>
  );
}
