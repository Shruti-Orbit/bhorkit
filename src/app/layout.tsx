import type { Metadata } from "next";
import {
  Figtree,
  Montserrat,
  Quicksand,
  Red_Hat_Display,
} from "next/font/google";
import { Header } from "@/src/components/layout/Header";
import { EcommerceTrustStrip } from "@/src/components/layout/EcommerceTrustStrip";
import { Footer } from "@/src/components/layout/Footer";
import { ShopProviders } from "@/src/components/providers/ShopProviders";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const redHatDisplay = Red_Hat_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-accent",
  subsets: ["latin"],
  display: "swap",
});

const quicksand = Quicksand({
  variable: "--font-soft",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bhorkit.com"),
  title: "BHORKIT",
  description: "Begin Your Day Divine",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${redHatDisplay.variable} ${montserrat.variable} ${quicksand.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ShopProviders>
          <Header />
          {children}
          <EcommerceTrustStrip />
          <Footer />
        </ShopProviders>
      </body>
    </html>
  );
}
