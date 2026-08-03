import { RevealContainer, RevealItem } from "@/components/motion-reveal";
import { AnimatedNumber } from "@/components/animated-counter";

const metrics = [
  { value: 12.4, decimals: 1, prefix: "$", suffix: "M", label: "Transaction volume" },
  { value: 98.6, decimals: 1, suffix: "%", label: "Compliance rate" },
  { value: 15000, decimals: 0, label: "Verified entities" },
  { value: 8, decimals: 0, label: "Active networks" },
];

const institutions = [
  "Meridian Bank",
  "Northgate Capital",
  "Aurora Trust",
  "Helios Logistics",
  "Vertex Pay",
  "Citadel Insurance",
];

export function TrustedBy() {
  return (
    <section className="border-y bg-card/40 py-14">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealContainer className="flex flex-col items-center gap-12">
          <RevealItem className="w-full">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border lg:grid-cols-4">
              {metrics.map((m) => (
                <div key={m.label} className="flex flex-col gap-1.5 bg-card px-6 py-7">
                  <dd className="order-first font-mono text-3xl font-semibold tracking-tight sm:text-4xl">
                    <AnimatedNumber
                      value={m.value}
                      decimals={m.decimals ?? 0}
                      prefix={m.prefix}
                      suffix={m.suffix}
                    />
                  </dd>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {m.label}
                  </dt>
                </div>
              ))}
            </dl>
          </RevealItem>

          <RevealItem className="w-full">
            <p className="mb-6 text-center text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Trusted by institutions moving real money
            </p>
            <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {institutions.map((name) => (
                <li
                  key={name}
                  className="font-heading text-sm font-semibold text-muted-foreground/70"
                >
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
