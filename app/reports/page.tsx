import Link from "next/link";
import dynamic from "next/dynamic";
import { getPublicReport, getPublicReportHistory } from "@/lib/database/reports";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

const ReportViewer = dynamic(() => import("@/components/report-viewer").then((m) => m.ReportViewer), {
  loading: () => <div className="h-64 animate-pulse rounded-xl border bg-card" />,
});

export const metadata = {
  title: "Activity records",
  description: "Clean, shareable activity records for every payment.",
};

export default async function ReportsPage() {
  const [report, history] = await Promise.all([getPublicReport(), getPublicReportHistory()]);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">{APP_TAGLINE}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Activity records</h1>
            <p className="mt-3 text-muted-foreground">
              Every payment you make is checked, approved, and recorded here — ready to share
              with your accountant or auditor on {APP_NAME}.
            </p>
          </div>

          {report ? (
            <ReportViewer report={report} history={history} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-20 text-center">
              <p className="text-sm font-medium">No activity records published yet</p>
              <p className="text-xs text-muted-foreground">
                Create a record from the dashboard, or run the demo walkthrough to make one.
              </p>
              <Link href="/demo" className="mt-2 text-sm font-medium text-primary hover:text-primary/80">
                Run the demo →
              </Link>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
