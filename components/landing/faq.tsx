import { RevealContainer, RevealItem } from "@/components/motion-reveal";

const faqs = [
  {
    question: "How fast can I start sending payments?",
    answer:
      "Right away. Verify your business once — it takes a couple of minutes — and you can create your first payment immediately. Most teams go from signup to a real payment in under ten minutes.",
  },
  {
    question: "Is my money safe?",
    answer:
      "Yes. Every payment is automatically checked for fraud, sanctions, and errors before it moves. Nothing leaves your account unless you approve it, and you can see the status of every payment at any time.",
  },
  {
    question: "Do I need any technical setup?",
    answer:
      "No. Everything happens in your workspace — create payments, review requests, and download records with a few clicks. There's nothing to install or configure.",
  },
  {
    question: "What records do I get?",
    answer:
      "Every payment is captured in a clean, shareable activity record you can download anytime — perfect for accountants, auditors, and your own books.",
  },
  {
    question: "Can I approve payments from my phone?",
    answer:
      "Yes. The workspace works on any device, so you can review and approve payments wherever you are.",
  },
  {
    question: "Who is this for?",
    answer:
      "Any business that pays others regularly — logistics, manufacturing, suppliers, exporters, payroll providers, and merchants all use the workspace to send and track payments.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 py-[120px]">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <RevealContainer className="mb-14 text-center">
          <RevealItem>
            <p className="mb-3 text-xs font-medium tracking-widest text-primary uppercase">
              FAQ
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Questions, answered
            </h2>
          </RevealItem>
        </RevealContainer>

        <RevealContainer className="space-y-4">
          {faqs.map((faq) => (
            <RevealItem key={faq.question}>
              <details className="group rounded-2xl border bg-card p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-open:rotate-45">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-3.5"
                      aria-hidden="true"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </details>
            </RevealItem>
          ))}
        </RevealContainer>
      </div>
    </section>
  );
}
