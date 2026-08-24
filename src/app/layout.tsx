import type { Metadata } from "next";
import {
  Figtree,
  Montserrat,
  Quicksand,
  Red_Hat_Display,
} from "next/font/google";
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

/**
 * Document shell only — fonts, global styles, <html> and <body>.
 *
 * The storefront's header, footer, cart drawer and promotional popups moved
 * into the (shop) route group's layout. They used to sit here, which meant the
 * admin panel rendered *inside* the customer site: no admin layout can remove
 * chrome a parent layout has already wrapped around it. Now they mount for
 * customer pages and are genuinely absent from /admin.
 *
 * (shop) is a route group, so it shapes the layout tree without appearing in
 * any URL — /cart is still /cart.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${redHatDisplay.variable} ${montserrat.variable} ${quicksand.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
