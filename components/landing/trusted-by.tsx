import { RevealContainer, RevealItem } from "@/components/motion-reveal";

const institutions = [
  "Meridian Bank",
  "Northgate Capital",
  "Aurora Trust",
  "Helios Logistics",
  "Vertex Pay",
  "Citadel Insurance",
  "Orbit Labs",
  "Falcon Foods",
];

export function TrustedBy() {
  return (
    <section className="border-y bg-muted/30 py-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealContainer className="flex flex-col items-center gap-8">
          <RevealItem>
            <p className="text-center text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Trusted by institutions moving real money
            </p>
          </RevealItem>
          <RevealItem>
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
