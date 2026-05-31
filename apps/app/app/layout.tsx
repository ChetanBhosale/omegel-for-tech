import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";

import "./globals.css";
import { QueryProvider } from "@/context/query-provider";
import { cn } from "@/lib/utils";

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
  title: "OmegelForTech — Meet developers, one conversation at a time",
  description:
    "Get paired with a random developer for a live 1-on-1 video chat. Trade ideas, pair on bugs, and meet builders from anywhere.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          "antialiased",
          inter.variable,
          instrumentSerif.variable,
          "font-sans"
        )}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
