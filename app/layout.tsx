import type { Metadata } from "next";
import { Inter, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appDescription =
  "Verified identity, verified assets, programmable compliance, autonomous execution, and immutable audit trails — the application layer on Cleanverse.";

export const metadata: Metadata = {
  metadataBase: new URL("https://cleanflow.dev"),
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description: appDescription,
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
  keywords: [
    "CleanFlow",
    "Cleanverse",
    "compliance",
    "payments",
    "identity verification",
    "blockchain",
    "Monad",
    "transaction orchestration",
  ],
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: appDescription,
    url: "https://cleanflow.dev",
    images: [{ url: "https://cleanflow.dev/opengraph-image", width: 1200, height: 630, alt: "CleanFlow" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: appDescription,
    images: ["https://cleanflow.dev/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
