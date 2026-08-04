import { LogoMark } from "@/components/logo";

export default function RootLoading() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background">
      <LogoMark className="size-10 animate-pulse" />
      <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Loading
      </p>
    </div>
  );
}