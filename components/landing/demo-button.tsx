"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { ArrowRightIcon, Loader2Icon, RefreshCwIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const DEMO_HREF = "/demo";

type DemoStatus = "idle" | "loading" | "error";

interface DemoButtonProps {
  className?: string;
  label?: string;
  showArrow?: boolean;
}

export function DemoButton({ className, label = "See it in action", showArrow = true }: DemoButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = React.useState<DemoStatus>("idle");

  const statusRef = React.useRef<DemoStatus>("idle");
  React.useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const pathnameRef = React.useRef(pathname);
  React.useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const attemptNavigation = React.useCallback(
    (source: "router" | "fallback" = "router"): boolean => {
      try {
        if (source === "router") {
          router.push(DEMO_HREF);
        } else {
          window.location.assign(DEMO_HREF);
        }
        return true;
      } catch {
        return false;
      }
    },
    [router],
  );

  // Stable handle used by the retry toast action, kept in sync via effect below.
  const retryRef = React.useRef<() => void>(() => {});

  const startDemo = React.useCallback(() => {
    if (statusRef.current === "loading") return;

    if (pathnameRef.current === DEMO_HREF) {
      toast("You're already on the demo page.");
      return;
    }

    setStatus("loading");

    if (!attemptNavigation("router")) {
      // Router failed synchronously — fall back to a hard navigation.
      if (attemptNavigation("fallback")) return;
      setStatus("error");
      toast.error("Could not open the demo. Please try again.", {
        action: { label: "Retry", onClick: () => retryRef.current() },
      });
      return;
    }

    // Watchdog: if the route hasn't changed shortly after navigation, retry.
    window.setTimeout(() => {
      if (statusRef.current !== "loading") return;
      if (pathnameRef.current === DEMO_HREF) return;
      if (attemptNavigation("fallback")) return;
      setStatus("error");
      toast.error("Could not open the demo. Please try again.", {
        action: { label: "Retry", onClick: () => retryRef.current() },
      });
    }, 2500);
  }, [attemptNavigation]);

  React.useEffect(() => {
    retryRef.current = startDemo;
  }, [startDemo]);

  return (
    <button
      type="button"
      onClick={startDemo}
      disabled={status === "loading"}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-80",
        className,
      )}
    >
      {status === "loading" ? (
        <>
          <Loader2Icon className="size-4 animate-spin" />
          Opening demo…
        </>
      ) : status === "error" ? (
        <>
          <RefreshCwIcon className="size-4" />
          Try again
        </>
      ) : (
        <>
          {label}
          {showArrow && <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />}</>
      )}
    </button>
  );
}
