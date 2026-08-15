import { ProductCollection } from "@/src/components/home/product-collection/ProductCollection";
import { getProductsByCollection } from "@/src/server/catalog/productService";

export const dynamic = "force-dynamic";

export default async function GaneshChaturthiShopPage() {
  const ganeshChaturthiProducts = await getProductsByCollection("ganesh-chaturthi");

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream py-8">
      <section className="px-4 pb-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1512px]">
          <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-gold">
            Ganesh Chaturthi
          </p>
          <h1 className="mt-2 font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
            Ganesh Chaturthi Collection
          </h1>
        </div>
      </section>
      <ProductCollection title="Ganesh Chaturthi Products" href="/shop" products={ganeshChaturthiProducts} />
    </main>
  );
}
