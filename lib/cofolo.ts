import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Catalog, Order, PlaceOrderInput, Product, ProductList, TrackResult } from "@/lib/types";

const REVALIDATE_SECONDS = 60;

export class CofoloError extends Error {
  readonly status: number;
  readonly details: string[];
  readonly requestId?: string;
  readonly retryAfter?: number;

  constructor(message: string, status: number, details: string[] = [], requestId?: string, retryAfter?: number) {
    super(message);
    this.name = "CofoloError";
    this.status = status;
    this.details = details;
    this.requestId = requestId;
    this.retryAfter = retryAfter;
  }
}

function config() {
  const base = process.env.COFOLO_API_URL;
  const key = process.env.COFOLO_CATALOG_KEY;
  if (!base || !key) {
    throw new Error("COFOLO_API_URL and COFOLO_CATALOG_KEY must be set.");
  }
  return { base: base.replace(/\/$/, ""), key };
}

async function call<T>(path: string, init: RequestInit = {}, withKey = true): Promise<T> {
  const { base, key } = config();
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (withKey) headers.set("x-api-key", key);

  const response = await fetch(`${base}${path}`, { ...init, headers });
  const body = (await response.json().catch(() => null)) as {
    data?: T;
    error?: { message?: string; requestId?: string; details?: string[] };
  } | null;

  if (!response.ok) {
    const retryHeader = response.headers.get("retry-after");
    const retryAfter = retryHeader ? Number(retryHeader) : undefined;
    const apiMessage = body?.error?.message ?? "Request failed";
    const message =
      response.status === 429 && Number.isFinite(retryAfter)
        ? `${apiMessage} Please wait ${retryAfter} seconds.`
        : apiMessage;
    throw new CofoloError(
      message,
      response.status,
      body?.error?.details ?? [],
      body?.error?.requestId,
      Number.isFinite(retryAfter) ? retryAfter : undefined,
    );
  }

  return body?.data as T;
}

export async function getCatalog() {
  "use cache";
  cacheLife({ stale: REVALIDATE_SECONDS, revalidate: REVALIDATE_SECONDS, expire: 300 });
  cacheTag("catalog");
  return call<Catalog>("");
}

export async function listProducts(params: Record<string, string | number> = {}) {
  "use cache";
  cacheLife({ stale: REVALIDATE_SECONDS, revalidate: REVALIDATE_SECONDS, expire: 300 });
  cacheTag("products");
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return call<ProductList>(`/products${qs ? `?${qs}` : ""}`);
}

export async function getProduct(slug: string) {
  "use cache";
  cacheLife({ stale: REVALIDATE_SECONDS, revalidate: REVALIDATE_SECONDS, expire: 300 });
  cacheTag("products", `product-${slug}`);
  return call<Product>(`/products/${encodeURIComponent(slug)}`);
}

export function placeOrder(order: PlaceOrderInput, idempotencyKey: string) {
  return call<{ order: import("@/lib/types").Order; replayed: boolean }>("/orders", {
    method: "POST",
    body: JSON.stringify({ ...order, website: "" }),
    headers: { "Idempotency-Key": idempotencyKey, "content-type": "application/json" },
    cache: "no-store",
  });
}

export function trackOrder(id: string) {
  const publicToken = /^[a-f0-9]{32,128}$/i.test(id);
  return call<TrackResult>(`/orders/${encodeURIComponent(id)}`, { cache: "no-store" }, !publicToken);
}

export function claimPayment(token: string, claim: { reference: string; paidOn?: string; amount?: number; note?: string }) {
  return call<{ order: Order }>(
    `/orders/${encodeURIComponent(token)}/payment`,
    { method: "POST", body: JSON.stringify(claim), cache: "no-store" },
    false,
  );
}
