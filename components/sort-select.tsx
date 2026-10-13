"use client";

import { useRouter } from "next/navigation";
import { SORTS, shopHref, type ShopQuery, type SortKey } from "@/lib/shop";

export function SortSelect({ query }: { query: ShopQuery }) {
  const router = useRouter();
  return (
    <label>
      <span className="sr-only">Sort by</span>
      <select
        className="sel"
        value={query.sort}
        onChange={(event) => router.push(shopHref(query, { sort: event.target.value as SortKey }))}
      >
        {SORTS.map((sort) => (
          <option key={sort.value} value={sort.value}>
            {sort.label}
          </option>
        ))}
      </select>
    </label>
  );
}
