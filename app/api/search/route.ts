import { NextRequest, NextResponse } from "next/server";
import { CofoloError, listProducts } from "@/lib/cofolo";

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
  if (q.length < 3) return NextResponse.json({ items: [], total: 0 });

  try {
    const data = await listProducts({ q, limit: 8 });
    return NextResponse.json({
      total: data.total,
      items: data.items.map((product) => ({
        slug: product.slug,
        name: product.name,
        summary: product.summary,
        category: product.category?.name ?? null,
        image: product.images[0]?.url ?? null,
        alt: product.images[0]?.alt || product.name,
      })),
    });
  } catch (error) {
    if (error instanceof CofoloError) {
      return NextResponse.json(
        { items: [], total: 0, message: error.message },
        { status: error.status, headers: error.retryAfter ? { "Retry-After": String(error.retryAfter) } : undefined },
      );
    }
    throw error;
  }
}
