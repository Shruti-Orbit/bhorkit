import type { CollectionProduct } from "@/src/data/products";
import { ApiClientError, apiGet } from "@/src/lib/api/client";

export type ProductCollectionKey =
  | "ganesh-chaturthi"
  | "navratri-upcoming"
  | "regular-pooja";

type ProductListMeta = {
  count: number;
};

type HomeCatalog = {
  ganeshChaturthiProducts: CollectionProduct[];
  navratriUpcomingProducts: CollectionProduct[];
  regularPoojaKits: CollectionProduct[];
};

type ProductDetailMeta = {
  included: {
    relatedProducts: CollectionProduct[];
    ganeshChaturthiProducts: CollectionProduct[];
    navratriUpcomingProducts: CollectionProduct[];
  };
};

export type ProductDetail = {
  product: CollectionProduct;
  relatedProducts: CollectionProduct[];
  ganeshChaturthiProducts: CollectionProduct[];
  navratriUpcomingProducts: CollectionProduct[];
};

export async function getHomeCatalog() {
  const response = await apiGet<HomeCatalog>("/products/home");
  return response.data;
}

export async function getProductsByCollection(collection: ProductCollectionKey) {
  const searchParams = new URLSearchParams({ collection });
  const response = await apiGet<CollectionProduct[], ProductListMeta>(
    `/products?${searchParams.toString()}`,
  );
  return response.data;
}

export async function getProductDetail(slug: string): Promise<ProductDetail | null> {
  try {
    const response = await apiGet<CollectionProduct, ProductDetailMeta>(
      `/products/${encodeURIComponent(slug)}`,
    );

    return {
      product: response.data,
      relatedProducts: response.meta?.included.relatedProducts ?? [],
      ganeshChaturthiProducts:
        response.meta?.included.ganeshChaturthiProducts ?? [],
      navratriUpcomingProducts:
        response.meta?.included.navratriUpcomingProducts ?? [],
    };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
