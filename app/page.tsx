import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { TrustedBy } from "@/components/landing/trusted-by";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { UseCases } from "@/components/landing/use-cases";
import { Testimonials } from "@/components/landing/testimonials";
import { Faq } from "@/components/landing/faq";
import { Cta } from "@/components/landing/cta";
import { SiteFooter } from "@/components/landing/site-footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <TrustedBy />
        <HowItWorks />
        <Features />
        <UseCases />
        <Testimonials />
        <Faq />
        <Cta />
      </main>
      <SiteFooter />
    </div>
  );
}