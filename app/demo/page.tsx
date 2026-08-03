import dynamic from "next/dynamic";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

const DemoWorkflow = dynamic(() => import("@/components/demo/demo-workflow").then((m) => m.DemoWorkflow));

export const metadata = {
  title: "Live demo",
  description: "Walk through identity verification, policy evaluation, settlement, and audit generation.",
};

export default function DemoPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <DemoWorkflow />
      </main>      <SiteFooter />
    </div>
  );
}
