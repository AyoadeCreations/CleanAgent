import { RevealContainer, RevealItem } from "@/components/motion-reveal";

const brands = ["Stripe", "Coinbase", "Ramp", "Mercury", "Brex", "Monad", "Cleanverse"];

export function TrustedBy() {
  return (
    <section className="border-y bg-surface/60 py-14">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <RevealContainer className="flex flex-col items-center gap-10">
          <RevealItem className="w-full">
            <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Powering the next generation of financial infrastructure
            </p>
          </RevealItem>
          <RevealItem className="w-full">
            <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {brands.map((name) => (
                <li key={name} className="font-heading text-xl font-semibold tracking-tight text-foreground/70">
                  {name}
                </li>
              ))}
            </ul>
          </RevealItem>
        </RevealContainer>
      </div>
    </section>
  );
}