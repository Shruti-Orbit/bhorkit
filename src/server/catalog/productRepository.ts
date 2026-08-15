import type { CollectionProduct } from "@/src/data/products";
import {
  ganeshChaturthiProducts,
  navratriUpcomingProducts,
  regularPoojaKits,
} from "@/src/data/products";
import { getMongoDb } from "@/src/server/db/mongodb";
import { AppError } from "@/src/server/errors/AppError";

export type ProductCollectionKey =
  | "ganesh-chaturthi"
  | "navratri-upcoming"
  | "regular-pooja";

export type CatalogProductDocument = CollectionProduct & {
  catalogCollection: ProductCollectionKey;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

const productsCollectionName = "products";
let indexesEnsured = false;
let seedEnsured = false;

export async function listProducts(options: {
  collection?: ProductCollectionKey;
  category?: string;
  availability?: CollectionProduct["availability"];
} = {}) {
  await ensureCatalogSeeded();

  const collection = await getProductsCollection();
  const query: Partial<Pick<CatalogProductDocument, "catalogCollection" | "category" | "availability">> = {};

  if (options.collection) {
    query.catalogCollection = options.collection;
  }

  if (options.category) {
    query.category = options.category;
  }

  if (options.availability) {
    query.availability = options.availability;
  }

  return collection
    .find(query, { projection: { _id: 0 } })
    .sort({ sortOrder: 1, name: 1 })
    .toArray();
}

export async function listProductSlugs() {
  await ensureCatalogSeeded();
  const collection = await getProductsCollection();
  const products = await collection.find({}, { projection: { _id: 0, slug: 1 } }).toArray();
  return products.map((product) => product.slug);
}

export async function findProductBySlug(slug: string) {
  await ensureCatalogSeeded();
  const collection = await getProductsCollection();
  return collection.findOne({ slug }, { projection: { _id: 0 } });
}

export async function listRelatedProducts(slug: string, limit = 3) {
  const product = await findProductBySlug(slug);

  if (!product) {
    return [];
  }

  const collection = await getProductsCollection();
  return collection
    .find(
      {
        slug: { $ne: slug },
        catalogCollection: product.catalogCollection,
      },
      { projection: { _id: 0 } },
    )
    .sort({ sortOrder: 1, name: 1 })
    .limit(limit)
    .toArray();
}

export async function ensureCatalogSeeded() {
  await ensureIndexes();

  if (seedEnsured) {
    return;
  }

  const collection = await getProductsCollection();
  const existingCount = await collection.estimatedDocumentCount();

  if (existingCount > 0) {
    seedEnsured = true;
    return;
  }

  const now = new Date().toISOString();
  const seedProducts = buildSeedProducts(now);

  if (seedProducts.length === 0) {
    throw new AppError("No seed products were found.", 500, "CATALOG_SEED_EMPTY");
  }

  await collection.bulkWrite(
    seedProducts.map((product) => ({
      updateOne: {
        filter: { id: product.id },
        update: { $set: product },
        upsert: true,
      },
    })),
  );

  seedEnsured = true;
}

async function ensureIndexes() {
  if (indexesEnsured) {
    return;
  }

  const collection = await getProductsCollection();
  await Promise.all([
    collection.createIndex({ id: 1 }, { unique: true }),
    collection.createIndex({ slug: 1 }, { unique: true }),
    collection.createIndex({ catalogCollection: 1, sortOrder: 1 }),
    collection.createIndex({ category: 1 }),
    collection.createIndex({ availability: 1 }),
  ]);

  indexesEnsured = true;
}

async function getProductsCollection() {
  const db = await getMongoDb();
  return db.collection<CatalogProductDocument>(productsCollectionName);
}

function buildSeedProducts(now: string): CatalogProductDocument[] {
  return [
    ...withCollection(ganeshChaturthiProducts, "ganesh-chaturthi", now),
    ...withCollection(navratriUpcomingProducts, "navratri-upcoming", now),
    ...withCollection(regularPoojaKits, "regular-pooja", now),
  ];
}

function withCollection(
  products: CollectionProduct[],
  catalogCollection: ProductCollectionKey,
  now: string,
) {
  return products.map((product, index) => ({
    ...product,
    catalogCollection,
    sortOrder: index,
    createdAt: now,
    updatedAt: now,
  }));
}
