import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";
import { QueryProvider } from "@/context/query-provider";
import { cn } from "@/lib/utils";
import { SITE, KEYWORDS } from "@/lib/seo";
import { MarkdownAlternateLink } from "@/components/seo/markdown-alternate-link";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.domain),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  keywords: KEYWORDS,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.domain }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: {
    canonical: SITE.domain,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.domain,
    locale: SITE.locale,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "OmegleForTech — Random video chat for developers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    creator: SITE.twitter,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body
        className={cn(
          "antialiased",
          inter.variable,
          instrumentSerif.variable,
          "font-sans"
        )}
      >
        <QueryProvider>{children}</QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
