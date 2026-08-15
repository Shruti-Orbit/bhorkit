import { NextResponse, type NextRequest } from "next/server";
import {
  listProducts,
  type ProductCollectionKey,
} from "@/src/server/catalog/productRepository";
import { toErrorResponse } from "@/src/server/errors/AppError";

export const dynamic = "force-dynamic";

const allowedCollections = new Set<ProductCollectionKey>([
  "ganesh-chaturthi",
  "navratri-upcoming",
  "regular-pooja",
]);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const collection = searchParams.get("collection");
    const category = searchParams.get("category") ?? undefined;
    const availability = searchParams.get("availability") ?? undefined;

    const products = await listProducts({
      collection: parseCollection(collection),
      category,
      availability:
        availability === "available" ||
        availability === "preorder" ||
        availability === "unavailable"
          ? availability
          : undefined,
    });

    return NextResponse.json({
      data: products,
      meta: {
        count: products.length,
      },
    });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}

function parseCollection(value: string | null) {
  if (!value) {
    return undefined;
  }

  return allowedCollections.has(value as ProductCollectionKey)
    ? (value as ProductCollectionKey)
    : undefined;
}
