import Link from "next/link";
import { Logo } from "@/components/logo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Verified identity", href: "#features" },
      { label: "Verified assets", href: "#features" },
      { label: "Compliance rules", href: "#features" },
      { label: "Autonomous agents", href: "#features" },
    ],
  },
  {
    title: "Use cases",
    links: [
      { label: "Payroll", href: "#use-cases" },
      { label: "Merchant payments", href: "#use-cases" },
      { label: "Supplier payments", href: "#use-cases" },
      { label: "Treasury management", href: "#use-cases" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/" },
      { label: "Architecture", href: "/" },
      { label: "Smart contracts", href: "/" },
      { label: "Status", href: "/" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Security", href: "/" },
      { label: "Careers", href: "/" },
      { label: "Contact", href: "/" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="max-w-sm">
            <Link href="/" aria-label="CleanFlow home" className="inline-flex">
              <Logo />
            </Link>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              The application layer on Cleanverse. Verified identity, verified assets,
              programmable compliance, and autonomous execution — with an immutable audit trail.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-sm font-medium">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} CleanFlow. Built on Cleanverse.</p>
          <p>Monad testnet · Demo data · Not financial advice</p>
        </div>
      </div>
    </footer>
  );
}
