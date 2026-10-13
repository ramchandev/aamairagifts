import Link from "next/link";
import { GiftThumb } from "@/components/gift-thumb";
import type { PhoneOrder } from "@/lib/orders-by-phone";
import { productThumbs, thumbFor } from "@/lib/product-thumbs";

function placedOn(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date(value));
}

export async function OrderList({ orders, phone }: { orders: PhoneOrder[]; phone: string }) {
  const thumbs = await productThumbs();
  return (
    <div className="order-pick">
      <h2>{orders.length === 1 ? "1 order" : `${orders.length} orders`}</h2>
      {orders.map(({ token, order }) => {
        const pieces = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const shown = order.items.slice(0, 4);
        const extra = order.items.length - shown.length;
        return (
          <Link key={order.id} href={`/order/${encodeURIComponent(token)}?phone=${encodeURIComponent(phone)}`}>
            <span className="mini-thumbs">
              {shown.map((item) => (
                <GiftThumb key={item.id} thumb={thumbFor(thumbs, item)} name={item.name} size={44} />
              ))}
              {extra > 0 ? <span className="more">+{extra}</span> : null}
            </span>
            <span className="meta">
              <strong>{order.number}</strong>
              <span className={`status-pill ${order.status}`}>{order.statusLabel}</span>
              <span className="when">
                {placedOn(order.placedAt)} · {pieces.toLocaleString("en-IN")} pieces
                {order.needsPricing ? " · Price to be added" : ""}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
