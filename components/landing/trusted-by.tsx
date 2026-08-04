import { RevealContainer, RevealItem } from "@/components/motion-reveal";

const brands = ["Cleanverse", "Monad", "Stripe", "Ramp", "Mercury", "Coinbase", "Base"];

export function TrustedBy() {
  return (
    <section className="border-b bg-background">
      <div className="mx-auto flex h-[120px] w-full max-w-[1440px] items-center justify-between gap-8 overflow-x-auto px-6 lg:px-12">
        <RevealContainer className="flex w-full items-center justify-between gap-10">
          {brands.map((name) => (
            <RevealItem key={name} className="shrink-0">
              <span className="whitespace-nowrap font-heading text-lg font-semibold tracking-tight text-foreground/35">
                {name}
              </span>
            </RevealItem>
          ))}
        </RevealContainer>
      </div>
    </section>
  );
}