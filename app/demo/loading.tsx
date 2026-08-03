import { Skeleton } from "@/components/ui/skeleton";

export default function DemoLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-8 sm:p-10">
        <Skeleton className="size-12 rounded-xl" />
        <Skeleton className="mt-5 h-8 w-72" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-8 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />
        <Skeleton className="mt-2 h-4 w-5/6" />
        <Skeleton className="mt-8 h-11 w-48" />
      </div>
    </div>
  );
}
