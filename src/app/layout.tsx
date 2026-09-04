import type { Metadata } from "next";
import {
  Figtree,
  Montserrat,
  Quicksand,
  Red_Hat_Display,
} from "next/font/google";
import { seoConfig } from "@/src/lib/seo/config";
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
  metadataBase: new URL(seoConfig.siteUrl),
  title: {
    default: "BHORKIT",
    template: "%s",
  },
  description: "Begin Your Day Divine",
  applicationName: seoConfig.siteName,
  manifest: "/site.webmanifest",
  // Served straight from public/ so every URL is a stable, unhashed site-root
  // path (/favicon.ico, /favicon-32x32.png, ...). Google re-crawls favicons on
  // its own schedule and keys them by URL, so these must not move again.
  //
  // Deliberately NOT using the app/favicon.ico file convention: it can only
  // describe the .ico, and having both would emit two competing icon tags.
  // One declaration site, one set of tags.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
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
