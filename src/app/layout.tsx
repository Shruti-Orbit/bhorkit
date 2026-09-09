import type { Metadata } from "next";
import {
  Figtree,
  Montserrat,
  Quicksand,
  Red_Hat_Display,
} from "next/font/google";
import Script from "next/script";
import { seoConfig } from "@/src/lib/seo/config";
import "./globals.css";

const googleAnalyticsIds = ["G-VFE9FMBC96", "G-HCGHGNZN1K"] as const;
const metaPixelId = "2559496271148556";

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
  // Google Merchant Center claims the domain by reading this tag out of the
  // homepage's <head>. It goes through the metadata API rather than a hand
  // written <meta>, so it is server-rendered into the initial HTML — the
  // gtag.js snippet below is created client-side after hydration and is not in
  // the raw HTML at all, which is why the analytics tag cannot do this job.
  //
  // The value is a claim on this domain and is meant to be public. Leave it in
  // place: Google re-checks it, and removing a verification tag un-verifies
  // the site.
  verification: {
    google: "k6K12pO3WgGu-thkWKYqdwD555a5HwbPiGldWJdzudM",
  },
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
      <body className="min-h-full">
        <Script id="meta-pixel" strategy="beforeInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsIds[0]}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            ${googleAnalyticsIds.map((id) => `gtag('config', '${id}');`).join("\n            ")}
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
