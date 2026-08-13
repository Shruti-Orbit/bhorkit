import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MasterDetailedPage } from "@/src/components/product-detail/MasterDetailedPage";
import {
  ganeshChaturthiProducts,
  getProductBySlug,
  getRelatedProducts,
} from "@/src/data/products";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return ganeshChaturthiProducts.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | BHORKIT",
    };
  }

  return {
    title: `${product.name} | BHORKIT`,
    description: product.subtitle,
    openGraph: {
      title: `${product.name} | BHORKIT`,
      description: product.subtitle,
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
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(slug);
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
      availability: "https://schema.org/PreOrder",
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
      <MasterDetailedPage product={product} relatedProducts={relatedProducts} />
    </>
  );
}
