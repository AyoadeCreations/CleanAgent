import Link from "next/link";
import { GlobeIcon, MailIcon, MessageCircleIcon } from "lucide-react";
import { Logo } from "@/components/logo";

const columns = [
  {
    title: "Products",
    links: [
      { label: "Business verification", href: "#platform" },
      { label: "Payment protection", href: "#platform" },
      { label: "Account rules", href: "#platform" },
      { label: "AI automations", href: "#platform" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Payroll", href: "#use-cases" },
      { label: "Merchant payments", href: "#use-cases" },
      { label: "Supplier payments", href: "#use-cases" },
      { label: "Treasury management", href: "#use-cases" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "/" },
      { label: "API reference", href: "/" },
      { label: "Architecture", href: "/" },
      { label: "Status", href: "/" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Activity records", href: "/reports" },
      { label: "Live demo", href: "/demo" },
      { label: "Account health", href: "/compliance" },
      { label: "Business hub", href: "/business" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Careers", href: "/" },
      { label: "Security", href: "/" },
      { label: "Contact", href: "/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/" },
      { label: "Terms", href: "/" },
      { label: "Account health", href: "/compliance" },
      { label: "Licensing", href: "/" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-surface/60">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_3fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" aria-label="CleanFlow home" className="inline-flex">
              <Logo />
            </Link>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Send, receive, approve, and track payments from one secure workspace — with
              safety checks on every payment and clean records for your books.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[
                { icon: MailIcon, label: "Email" },
                { icon: GlobeIcon, label: "Website" },
                { icon: MessageCircleIcon, label: "Community" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="inline-flex size-10 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h3 className="text-sm font-semibold">{column.title}</h3>
                <ul className="mt-5 space-y-3">
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

          <div className="lg:justify-self-end">
            <h3 className="text-sm font-semibold">Stay in the loop</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Product updates and platform news, monthly.
            </p>
            <form className="mt-5 flex items-center gap-2">
              <label htmlFor="newsletter" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter"
                type="email"
                placeholder="you@company.com"
                className="h-11 w-full rounded-full border bg-card px-4 text-sm outline-none ring-primary/20 transition-shadow focus:ring-2"
              />
              <button
                type="button"
                className="h-11 shrink-0 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} CleanFlow. Built on Cleanverse.</p>
          <p>Monad testnet &middot; Demo data &middot; Not financial advice</p>
        </div>
      </div>
    </footer>
  );
}
