import "server-only";
import { listOrdersByPhone } from "@/lib/cofolo";
import type { ListedOrder, ListedOrderItem, OrderStatus, PhoneOrderList } from "@/lib/types";

const STATUSES = new Set<OrderStatus>(["received", "payment_pending", "confirmed", "complete", "cancelled"]);

function listedItem(value: unknown): ListedOrderItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as ListedOrderItem;
  const quantity = Number(item.quantity);
  if (typeof item.name !== "string" || !item.name.trim()) return null;
  if (!Number.isFinite(quantity) || quantity < 1) return null;
  return { name: item.name.trim(), quantity, unit: typeof item.unit === "string" && item.unit ? item.unit : "piece" };
}

function listedOrder(value: unknown): ListedOrder | null {
  if (!value || typeof value !== "object") return null;
  const row = value as ListedOrder;
  if (typeof row.token !== "string" || !/^[a-f0-9]{32,128}$/i.test(row.token)) return null;
  if (typeof row.number !== "string" || !row.number || row.number.length > 40) return null;
  if (!STATUSES.has(row.status)) return null;
  const items = Array.isArray(row.items) ? row.items.map(listedItem).filter((item): item is ListedOrderItem => item !== null) : [];
  const shipment = row.shipment && typeof row.shipment === "object" ? row.shipment : null;
  return {
    token: row.token,
    number: row.number,
    status: row.status,
    statusLabel: typeof row.statusLabel === "string" && row.statusLabel ? row.statusLabel : row.status,
    needsPricing: Boolean(row.needsPricing),
    currency: typeof row.currency === "string" && row.currency ? row.currency : "INR",
    placedAt: typeof row.placedAt === "string" ? row.placedAt : "",
    total: typeof row.total === "number" ? row.total : null,
    itemCount: typeof row.itemCount === "number" ? row.itemCount : items.length,
    items,
    shipment,
  };
}

export async function ordersForPhone(phone: string): Promise<PhoneOrderList> {
  const result = await listOrdersByPhone(phone.trim());
  const orders = (Array.isArray(result.orders) ? result.orders : []).map(listedOrder).filter((order): order is ListedOrder => order !== null);
  return { orders, hasMore: Boolean(result.hasMore) };
}
