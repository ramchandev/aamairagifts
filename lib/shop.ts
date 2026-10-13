import type { Product } from "@/lib/types";

export const SORTS = [
  { value: "default", label: "Most loved" },
  { value: "newest", label: "New arrivals" },
  { value: "name", label: "Name A–Z" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
] as const;

export type SortKey = (typeof SORTS)[number]["value"];

export interface ShopQuery {
  category: string;
  q: string;
  sort: SortKey;
  page: number;
  materials: string[];
  personal: boolean;
  useful: boolean;
}

const SORT_VALUES = new Set<string>(SORTS.map((sort) => sort.value));

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function many(value: string | string[] | undefined) {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).map((item) => item.trim()).filter(Boolean);
}

export function parseShopQuery(sp: Record<string, string | string[] | undefined>): ShopQuery {
  const sortRaw = one(sp.sort) ?? "default";
  const page = Math.max(1, Math.min(500, Number(one(sp.page)) || 1));
  return {
    category: one(sp.category)?.trim() ?? "",
    q: one(sp.q)?.trim() ?? "",
    sort: SORT_VALUES.has(sortRaw) ? (sortRaw as SortKey) : "default",
    page: Number.isFinite(page) ? page : 1,
    materials: many(sp.material),
    personal: one(sp.personal) === "1",
    useful: one(sp.useful) === "1",
  };
}

export function shopHref(current: ShopQuery, patch: Partial<ShopQuery> = {}) {
  const next: ShopQuery = { ...current, ...patch };
  const filterChanged = (["category", "q", "sort", "materials", "personal", "useful"] as const).some((key) => key in patch);
  if (filterChanged && !("page" in patch)) next.page = 1;

  const params = new URLSearchParams();
  if (next.category) params.set("category", next.category);
  if (next.q) params.set("q", next.q);
  if (next.sort !== "default") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  for (const material of next.materials) params.append("material", material);
  if (next.personal) params.set("personal", "1");
  if (next.useful) params.set("useful", "1");
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export function toggleMaterial(materials: string[], material: string) {
  return materials.includes(material) ? materials.filter((item) => item !== material) : [...materials, material];
}

export function attr(product: Product, name: string) {
  return product.attributes.find((item) => item.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

export function isYes(value: string) {
  return ["true", "yes", "1"].includes(value.trim().toLowerCase());
}

export function applyLocalFilters(items: Product[], query: ShopQuery) {
  return items.filter((product) => {
    if (query.materials.length && !query.materials.includes(attr(product, "Material"))) return false;
    if (query.personal && !isYes(attr(product, "Personal"))) return false;
    if (query.useful && !isYes(attr(product, "Useful"))) return false;
    return true;
  });
}

export function hasLocalFilters(query: ShopQuery) {
  return query.materials.length > 0 || query.personal || query.useful;
}
