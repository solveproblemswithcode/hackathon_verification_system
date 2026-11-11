import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "@/components/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShipProof: verified results for startup competitions",
  description:
    "A clickable proof of concept: a simple verification layer for a 30-day, profit-based startup competition.",
  // Prototype with mock data: keep it out of search engines.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
