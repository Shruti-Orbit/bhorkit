import type { CollectionProduct, ShopCategorySlug } from "@/src/data/products";
import { ApiClientError, apiGet } from "@/src/lib/api/client";

export type { ShopCategorySlug } from "@/src/data/products";

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

/**
 * Products in one Shop range. Filtering happens in MongoDB — the products
 * collection is indexed on `shopCategory` — rather than by fetching the whole
 * catalogue and narrowing in the browser.
 */
export async function getProductsByShopCategory(shopCategory: ShopCategorySlug) {
  const searchParams = new URLSearchParams({ shopCategory });
  const response = await apiGet<CollectionProduct[], ProductListMeta>(
    `/products?${searchParams.toString()}`,
  );
  return response.data;
}

export async function getAllProducts() {
  const response = await apiGet<CollectionProduct[], ProductListMeta>("/products");
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
