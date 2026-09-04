import { ShopListing } from "@/src/components/shop/ShopListing";
import type { ShopListingSection } from "@/src/components/shop/ShopListing";
import { withNavratriComingSoonPresentation } from "@/src/data/navratriComingSoon";
import { shopPurchaseStates } from "@/src/data/shopPurchaseStates";
import { getAllProducts } from "@/src/lib/api/product.api";

export const dynamic = "force-dynamic";

/**
 * Shop All — the whole catalogue, grouped by what a shopper can actually do
 * with each kit.
 *
 * The header's Shop entry now opens a category dropdown instead of navigating
 * here, so this page is reached directly or from the footer. It used to fetch
 * only the Ganesh Chaturthi collection while titled "Shop All", which is the
 * behaviour the dropdown replaced; showing every product makes the page match
 * its own heading, and each individual range has its own /shop/<category> URL.
 *
 * Those twelve products then arrived as one undifferentiated grid, which put a
 * kit that can be reserved today beside one that has not launched. They are
 * grouped by `purchaseState` — not by `shopCategory`, which the nav and the
 * /shop/<category> pages already cover — so the split answers "can I order
 * this yet?" rather than repeating the range breakdown one click away.
 */
export default async function ShopPage() {
  const products = await getAllProducts();

  // The same coming-soon treatment the home page gives Navratri: those kits
  // have no shot photography yet, so the real images are placeholders that
  // would read as finished products here while the home page shows otherwise.
  const navratriProducts = withNavratriComingSoonPresentation(
    products.filter((product) => product.shopCategory === "navratri-upcoming"),
  );
  const presentedProducts = products.map(
    (product) =>
      navratriProducts.find((navratri) => navratri.id === product.id) ?? product,
  );

  // Driven by shopPurchaseStates so the order and copy live in one place, and
  // a state the API starts returning cannot silently vanish from the page.
  const sections: ShopListingSection[] = shopPurchaseStates.map((section) => ({
    key: section.state,
    title: section.title,
    description: section.description,
    tone: section.tone,
    variant: section.variant,
    products: presentedProducts.filter(
      (product) => product.purchaseState === section.state,
    ),
  }));

  return (
    <ShopListing
      eyebrow="Shop All"
      title="BHORKIT Puja Essentials"
      sections={sections}
    />
  );
}
