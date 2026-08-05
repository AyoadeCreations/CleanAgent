import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Brand mark — the CleanFlow logo mark, served as an image asset.
 * Transparent background, works on light and dark surfaces.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={2000}
      height={2000}
      className={cn("size-8 object-contain", className)}
      priority
    />
  );
}

/** Alias kept for backwards compatibility — renders the same mark. */
export function LogoMarkMono({ className }: { className?: string }) {
  return <LogoMark className={className} />;
}

export function Logo({
  className,
  markClassName,
  inverse = false,
}: {
  className?: string;
  markClassName?: string;
  inverse?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markClassName} />
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
