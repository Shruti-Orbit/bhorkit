import type { CollectionProduct } from "@/src/data/products";
import { ProductBreadcrumb } from "./ProductBreadcrumb";
import { ProductHero } from "./ProductHero";
import { ProductSections } from "./ProductSections";
import { ProductReviews } from "./ProductReviews";
import { FinalProductCta } from "./FinalProductCta";
import { MobileStickyCta } from "./MobileStickyCta";

type MasterDetailedPageProps = {
  product: CollectionProduct;
  relatedProducts: CollectionProduct[];
};

export function MasterDetailedPage({
  product,
  relatedProducts,
}: MasterDetailedPageProps) {
  return (
    <main className="flex flex-1 flex-col bg-bhor-cream pb-20 md:pb-0">
      <ProductBreadcrumb product={product} />
      <ProductHero product={product} />
      <ProductSections product={product} relatedProducts={relatedProducts} />
      <ProductReviews reviews={product.reviews} />
      <FinalProductCta product={product} />
      <MobileStickyCta product={product} />
    </main>
  );
}
