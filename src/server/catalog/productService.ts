import {
  findProductBySlug,
  listProducts,
  listProductSlugs,
  listRelatedProducts,
  type ProductCollectionKey,
} from "./productRepository";

export async function getProductsByCollection(collection: ProductCollectionKey) {
  return listProducts({ collection });
}

export async function getHomeCatalog() {
  const [ganeshChaturthiProducts, navratriUpcomingProducts, regularPoojaKits] =
    await Promise.all([
      getProductsByCollection("ganesh-chaturthi"),
      getProductsByCollection("navratri-upcoming"),
      getProductsByCollection("regular-pooja"),
    ]);

  return {
    ganeshChaturthiProducts,
    navratriUpcomingProducts,
    regularPoojaKits,
  };
}

export async function getProductDetail(slug: string) {
  const product = await findProductBySlug(slug);

  if (!product) {
    return null;
  }

  const [relatedProducts, ganeshChaturthiProducts, navratriUpcomingProducts] =
    await Promise.all([
      listRelatedProducts(slug),
      getProductsByCollection("ganesh-chaturthi"),
      getProductsByCollection("navratri-upcoming"),
    ]);

  return {
    product,
    relatedProducts,
    ganeshChaturthiProducts,
    navratriUpcomingProducts,
  };
}

export async function getCatalogSlugs() {
  return listProductSlugs();
}
