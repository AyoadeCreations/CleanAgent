import { RevealContainer, RevealItem } from "@/components/motion-reveal";

const platforms = ["Monad", "Cleanverse", "USDC", "USDT", "Ethereum", "Base"];

export function TrustedBy() {
  return (
    <section className="border-b bg-background">
      <div className="mx-auto flex h-24 w-full max-w-[1440px] items-center gap-6 px-8 lg:px-12">
        <RevealContainer className="flex w-full items-center gap-6">
          <RevealItem>
            <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Built on
            </span>
          </RevealItem>
          <RevealItem className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-8 overflow-x-auto">
              {platforms.map((name) => (
                <span
                  key={name}
                  className="shrink-0 whitespace-nowrap font-heading text-lg font-semibold tracking-tight text-foreground/35"
                >
                  {name}
                </span>
              ))}
            </div>
          </RevealItem>
        </RevealContainer>
      </div>
    </section>
  );
}
