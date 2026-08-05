import dynamic from "next/dynamic";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

const DemoWorkflow = dynamic(() => import("@/components/demo/demo-workflow").then((m) => m.DemoWorkflow));

export const metadata = {
  title: "Live demo",
  description: "Walk through verifying your business, creating a payment, approving it, and downloading your record.",
};

export default function DemoPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <DemoWorkflow />
      </main>
      <SiteFooter />
    </div>
  );
}
