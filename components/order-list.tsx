import Link from "next/link";
import { GiftThumb } from "@/components/gift-thumb";
import { formatMoney } from "@/lib/money";
import { productThumbs } from "@/lib/product-thumbs";
import type { ListedOrder } from "@/lib/types";

function placedOn(value: string) {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return "";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date(time));
}

function pieces(order: ListedOrder) {
  const counted = order.items.reduce((sum, item) => sum + item.quantity, 0);
  return counted || order.itemCount;
}

export async function OrderList({ orders, phone, hasMore }: { orders: ListedOrder[]; phone: string; hasMore: boolean }) {
  const thumbs = await productThumbs();
  return (
    <div className="order-pick">
      <h2>{orders.length === 1 ? "1 order" : `${orders.length} orders`}</h2>
      {orders.map((order) => {
        const shown = order.items.slice(0, 4);
        const extra = order.items.length - shown.length;
        const when = [
          placedOn(order.placedAt),
          `${pieces(order).toLocaleString("en-IN")} pieces`,
          order.needsPricing || order.total === null ? "Price to be added" : formatMoney(order.total, order.currency),
        ]
          .filter(Boolean)
          .join(" · ");
        const courier = [order.shipment?.partner, order.shipment?.trackingCode].filter(Boolean).join(" · ");
        return (
          <Link key={order.token} href={`/order/${encodeURIComponent(order.token)}?phone=${encodeURIComponent(phone)}`}>
            <span className="mini-thumbs">
              {shown.map((item, index) => (
                <GiftThumb key={`${item.name}-${index}`} thumb={thumbs.get(item.name) ?? null} name={item.name} size={44} />
              ))}
              {extra > 0 ? <span className="more">+{extra}</span> : null}
            </span>
            <span className="meta">
              <strong>{order.number}</strong>
              <span className={`status-pill ${order.status}`}>{order.statusLabel}</span>
              <span className="when">{when}</span>
              {courier ? <span className="when">{courier}</span> : null}
            </span>
          </Link>
        );
      })}
      {hasMore ? <p className="when">Showing the latest 20 orders for this number.</p> : null}
    </div>
  );
}
