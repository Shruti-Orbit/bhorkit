import type { Metadata } from "next";
import { ProductCollection } from "@/src/components/home/product-collection/ProductCollection";
import { getProductsByShopCategory } from "@/src/lib/api/product.api";
import { seoConfig } from "@/src/lib/seo/config";

export const dynamic = "force-dynamic";

const pageSeo = seoConfig.pages["/pre-order"];

export const metadata: Metadata = {
  title: pageSeo.title,
  description: pageSeo.description,
  keywords: [...pageSeo.keywords],
  alternates: {
    canonical: "/pre-order",
  },
};

export default async function PreOrderPage() {
  const navratriUpcomingProducts = await getProductsByShopCategory("navratri-upcoming");

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream">
      <ProductCollection
        title="Navratri 2026"
        description="Pre-order your Navratri puja kits for delivery across Patna."
        href="/pre-order"
        products={navratriUpcomingProducts}
      />
    </main>
  );
}
