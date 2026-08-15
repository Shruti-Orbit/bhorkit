import { NextResponse, type NextRequest } from "next/server";
import { getProductDetail } from "@/src/server/catalog/productService";
import { toErrorResponse } from "@/src/server/errors/AppError";

export const dynamic = "force-dynamic";

type ProductRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: NextRequest, context: ProductRouteContext) {
  try {
    const { slug } = await context.params;
    const detail = await getProductDetail(slug);

    if (!detail) {
      return NextResponse.json(
        {
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: "Product not found.",
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: detail.product,
      included: {
        relatedProducts: detail.relatedProducts,
        ganeshChaturthiProducts: detail.ganeshChaturthiProducts,
        navratriUpcomingProducts: detail.navratriUpcomingProducts,
      },
    });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
