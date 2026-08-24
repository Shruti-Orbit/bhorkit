import { Header } from "@/src/components/layout/Header";
import { EcommerceTrustStrip } from "@/src/components/layout/EcommerceTrustStrip";
import { Footer } from "@/src/components/layout/Footer";
import { ShopProviders } from "@/src/components/providers/ShopProviders";

/**
 * The customer storefront's chrome: announcement bar, header and navigation,
 * trust strip, footer, plus the shop-wide providers (cart drawer, login modal,
 * promotional popup, toasts).
 *
 * Everything here is scoped to this route group, so /admin — which sits
 * outside it — inherits none of it.
 */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col overflow-x-hidden">
      <ShopProviders>
        <Header />
        {children}
        <EcommerceTrustStrip />
        <Footer />
      </ShopProviders>
    </div>
  );
}
