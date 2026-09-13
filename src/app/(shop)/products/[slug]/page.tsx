import { isOutOfStockProduct } from "@/src/utils/productState";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MasterDetailedPage } from "@/src/components/product-detail/MasterDetailedPage";
import { getProductDetail } from "@/src/lib/api/product.api";
import { seoConfig } from "@/src/lib/seo/config";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getProductDetail(slug);
  const product = detail?.product;

  if (!product) {
    // Raised here, not just in the component below, because metadata is
    // resolved first: once it returns successfully Next has committed a 200
    // and begun streaming, and a notFound() thrown afterwards can only swap
    // the body — leaving a "soft 404" that search engines index as a real
    // page. /shop/[category] does the same for the same reason.
    notFound();
  }

  const seo = seoConfig.products[slug as keyof typeof seoConfig.products];
  const title = seo?.title ?? `${product.name} | BHORKIT`;
  const description = seo?.description ?? product.subtitle;

  return {
    title,
    description,
    keywords: seo ? [...seo.keywords] : undefined,
    alternates: {
      canonical: `/products/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: [
        {
          url: product.image,
          alt: product.imageAlt,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const detail = await getProductDetail(slug);

  if (!detail) {
    notFound();
  }

  const product = detail.product;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.subtitle,
    image: product.images.map((image) => image.src),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price.replace(/[^\d]/g, ""),
      // A deactivated kit must not be advertised to search engines as open
      // for pre-order.
      availability: isOutOfStockProduct(product)
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/PreOrder",
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: "/shop",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: product.href,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <MasterDetailedPage
        product={product}
        relatedProducts={detail.relatedProducts}
        ganeshChaturthiProducts={detail.ganeshChaturthiProducts}
        navratriUpcomingProducts={detail.navratriUpcomingProducts}
      />
    </>
  );
}
