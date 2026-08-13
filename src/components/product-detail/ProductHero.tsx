import type { CollectionProduct } from "@/src/data/products";
import { ProductGallery } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";

type ProductHeroProps = {
  product: CollectionProduct;
};

export function ProductHero({ product }: ProductHeroProps) {
  return (
    <section className="mx-auto grid max-w-[1640px] items-start gap-7 px-4 py-4 sm:px-6 md:grid-cols-[64%_36%] lg:px-8 lg:py-8">
      <div className="md:sticky md:top-6 md:self-start">
        <ProductGallery images={product.images} title={product.name} />
      </div>
      <ProductInfo product={product} />
    </section>
  );
}
