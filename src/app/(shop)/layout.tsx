import { Header } from "@/src/components/layout/Header";
import { EcommerceTrustStrip } from "@/src/components/layout/EcommerceTrustStrip";
import { Footer } from "@/src/components/layout/Footer";
import { ShopProviders } from "@/src/components/providers/ShopProviders";
import { WhatsAppStickyCta } from "@/src/components/layout/WhatsAppStickyCta";

/**
 * The customer storefront's chrome: announcement bar, header and navigation,
 * trust strip, footer, plus the shop-wide providers (cart drawer, login modal,
 * promotional popup, toasts).
 *
 * Everything here is scoped to this route group, so /admin — which sits
 * outside it — inherits none of it.
 */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  // overflow-x-clip, not -hidden: `overflow-x: hidden` makes the browser
  // compute `overflow-y` to `auto`, turning this wrapper into a scroll
  // container. Sticky children then resolve against *it* rather than the
  // viewport, and since this wrapper never scrolls itself, every
  // `position: sticky` inside the storefront silently stops working — the
  // product gallery being the one that showed it. `clip` clips the same
  // horizontal overflow without creating a scroll container.
  return (
    <div className="flex min-h-full flex-col overflow-x-clip">
      <ShopProviders>
        <Header />
        {children}
        <EcommerceTrustStrip />
        <Footer />
        <WhatsAppStickyCta />
      </ShopProviders>
    </div>
  );
}
