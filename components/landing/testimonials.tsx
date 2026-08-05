import Image from "next/image";
import { RevealContainer, RevealItem } from "@/components/motion-reveal";

const testimonials = [
  {
    quote:
      "We used to chase payments across spreadsheets and approval queues. Now a payment that took three days takes minutes — and the records are right there when we need them.",
    name: "Amara Okafor",
    title: "CFO, Meridian Logistics",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80",
  },
  {
    quote:
      "Payroll, supplier payouts, everything lives in one place. Every payment is checked before it goes out, and compliance went from a quarterly scramble to something we just glance at.",
    name: "Daniel Reyes",
    title: "Treasury Lead, Northgate Capital",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80",
  },
  {
    quote:
      "We set the limits, the workspace handles the rest. Payments go out on their own within the boundaries we define — without us surrendering control.",
    name: "Sofia Lindqvist",
    title: "Head of Compliance, Aurora Trust",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=900&q=80",
  },
];

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <RevealContainer className="mx-auto mb-16 max-w-2xl text-center">
          <RevealItem>
            <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Trusted by teams moving real money
            </h2>
          </RevealItem>
        </RevealContainer>

        <RevealContainer className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <RevealItem key={t.name} className="h-full">
              <figure className="flex h-full flex-col gap-6 rounded-[24px] bg-card p-8 ring-1 ring-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                <div className="relative aspect-square w-full overflow-hidden rounded-[20px]">
                  <Image
                    src={t.image}
                    alt={t.name}
                    fill
                    sizes="(min-width: 1024px) 30vw, 100vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                <blockquote className="flex-1 text-base leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption>
                  <p className="font-semibold">{t.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{t.title}</p>
                </figcaption>
              </figure>
            </RevealItem>
          ))}
        </RevealContainer>
      </div>
    </section>
  );
}
