import "server-only";
import { listProducts } from "@/lib/cofolo";
import { applyLocalFilters, type ShopQuery } from "@/lib/shop";
import type { Product } from "@/lib/types";

export interface ShopResult {
  items: Product[];
  total: number;
  facetItems: Product[];
  truncated: boolean;
}

export async function loadShop(query: ShopQuery): Promise<ShopResult> {
  const params: Record<string, string | number> = {};
  if (query.category) params.category = query.category;
  if (query.q) params.q = query.q;
  if (query.sort !== "default") params.sort = query.sort;

  const collected: Product[] = [];
  let page = 1;
  let truncated = false;
  while (page <= 20) {
    const result = await listProducts({ ...params, limit: 100, page });
    collected.push(...result.items);
    if (!result.hasMore) break;
    page += 1;
    if (page > 20) truncated = true;
  }

  const items = applyLocalFilters(collected, query);
  return { items, total: items.length, facetItems: collected, truncated };
}
