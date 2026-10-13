import "server-only";
import { listProducts } from "@/lib/cofolo";

export interface Thumb {
  url: string;
  alt: string;
}

export async function productThumbs() {
  const map = new Map<string, Thumb>();
  let page = 1;
  while (page <= 5) {
    const result = await listProducts({ limit: 100, page });
    for (const product of result.items) {
      const image = product.images[0];
      if (!image?.url) continue;
      const thumb = { url: image.url, alt: image.alt || product.name };
      map.set(product.id, thumb);
      if (product.sku) map.set(product.sku, thumb);
    }
    if (!result.hasMore) break;
    page += 1;
  }
  return map;
}

export function thumbFor(thumbs: Map<string, Thumb>, item: { sku: string | null; productId: string | null }) {
  if (item.sku && thumbs.has(item.sku)) return thumbs.get(item.sku) ?? null;
  if (item.productId && thumbs.has(item.productId)) return thumbs.get(item.productId) ?? null;
  return null;
}
