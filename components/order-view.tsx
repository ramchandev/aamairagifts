import Link from "next/link";
import { GiftThumb } from "@/components/gift-thumb";
import { PaymentClaim } from "@/components/payment-claim";
import { formatMoney } from "@/lib/money";
import { productThumbs, thumbFor } from "@/lib/product-thumbs";
import { orderStatusCopy } from "@/lib/site";
import type { Order, OrderStatus } from "@/lib/types";

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "received", label: "Order received" },
  { status: "payment_pending", label: "Price added" },
  { status: "confirmed", label: "Payment received" },
  { status: "complete", label: "Shipped" },
];

function money(amount: number | null, currency: string) {
  if (amount == null) return null;
  return formatMoney(amount, currency);
}

function when(value: string, withTime = false) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: withTime ? "short" : undefined,
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function courierLink(url: string) {
  try {
    const host = new URL(url).hostname;
    if (host === "cofolo.in" || host.endsWith(".cofolo.in")) return null;
    return url;
  } catch {
    return null;
  }
}

type TimelineEvent = {
  key: string;
  label: string;
  detail: string;
  state: "done" | "now" | "todo";
  status?: OrderStatus;
};

function timeline(order: Order): TimelineEvent[] {
  const placed = when(order.placedAt, true);
  if (order.status === "cancelled") {
    return [
      { key: "received", label: "Order received", detail: placed, state: "done" },
      ...(order.payment ? [{ key: "payment", label: "Price added", detail: "", state: "done" as const, status: "payment_pending" as const }] : []),
      ...(order.shipment ? [{ key: "shipped", label: "Shipped", detail: when(order.shipment.shippedAt), state: "done" as const, status: "complete" as const }] : []),
      { key: "cancelled", label: "Cancelled", detail: order.cancelledReason || "This order was cancelled.", state: "now" },
    ];
  }
  const at = STEPS.findIndex((step) => step.status === order.status);
  return STEPS.map((step, index) => {
    const label = step.status === "payment_pending" && order.needsPricing && at < 1 ? "Waiting for a price" : step.label;
    let detail = "";
    if (step.status === "received") detail = placed;
    if (step.status === "complete" && order.shipment?.shippedAt) detail = when(order.shipment.shippedAt);
    if (index === at) detail = [detail, orderStatusCopy(order.status, order.needsPricing, order.cancelledReason)].filter(Boolean).join(" · ");
    return {
      key: step.status,
      label,
      detail,
      state: index < at ? ("done" as const) : index === at ? ("now" as const) : ("todo" as const),
      status: step.status,
    };
  });
}

function PaymentDetails({ order, token }: { order: Order; token?: string }) {
  const payment = order.payment;
  if (!payment) return null;
  const waiting = order.status === "payment_pending" && !payment.claimedAt;
  return (
    <div className="pay-box">
      <b>Pay {formatMoney(payment.amountDue, payment.currency)}</b>
      <div>Reference {payment.reference}</div>
      {payment.payeeName ? <div>{payment.payeeName}</div> : null}
      {payment.upiId ? <div>UPI: {payment.upiId}</div> : null}
      {payment.upiQrUrl ? (
        // The QR host is chosen by COFOLO and is not one of our image domains.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={payment.upiQrUrl} alt="UPI QR code" width={160} height={160} />
      ) : null}
      {payment.bankDetails ? <div className="bank">{payment.bankDetails}</div> : null}
      {payment.claimedAt ? <div>Payment sent{payment.claimReference ? ` · ${payment.claimReference}` : ""}</div> : null}
      {waiting && token ? <PaymentClaim token={token} /> : null}
    </div>
  );
}

function CourierDetails({ order }: { order: Order }) {
  const shipment = order.shipment;
  if (!shipment) return null;
  const courier = shipment.trackingUrl ? courierLink(shipment.trackingUrl) : null;
  return (
    <div className="pay-box">
      <b>{shipment.partner || "Courier"}</b>
      {shipment.trackingCode ? <div>Tracking ID {shipment.trackingCode}</div> : null}
      {courier ? (
        <div>
          <a href={courier}>Open the courier page</a>
        </div>
      ) : null}
    </div>
  );
}

export async function OrderView({ order, backHref = "/track", token }: { order: Order; backHref?: string; token?: string }) {
  const thumbs = await productThumbs();
  const priced = !order.needsPricing && order.items.some((item) => item.unitPrice != null || item.lineTotal != null);
  const rows = [
    ["Subtotal", money(order.subtotal, order.currency)],
    ["Tax", money(order.taxTotal, order.currency)],
    ["Shipping", money(order.shippingAmount, order.currency)],
    ["Round off", money(order.roundOff, order.currency)],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  const pincode = order.shippingAddress?.postalCode;
  const events = timeline(order);

  return (
    <article className="track-card">
      <Link className="back-link" href={backHref}>
        ← Orders
      </Link>
      <p className="track-meta">Order ID</p>
      <h1>{order.number}</h1>
      {order.thankYouNote ? <p>{order.thankYouNote}</p> : null}
      <p className="track-meta">
        Placed {when(order.placedAt, true)}
        {order.customer?.name ? ` · ${order.customer.name}` : ""}
        {pincode ? ` · Pincode ${pincode}` : ""}
      </p>
      <ol className="timeline" aria-label="Order status">
        {events.map((event) => (
          <li key={event.key} className={event.state}>
            <b>{event.label}</b>
            {event.detail ? <span>{event.detail}</span> : null}
            {event.status === "payment_pending" ? <PaymentDetails order={order} token={token} /> : null}
            {event.status === "complete" ? <CourierDetails order={order} /> : null}
          </li>
        ))}
      </ol>
      {order.needsPricing ? <p className="banner info">Prices are not on this order yet. They will appear here after we add them.</p> : null}
      <table className="order-items">
        <thead>
          <tr>
            <th>Gift</th>
            <th>Qty</th>
            {priced ? <th>Price</th> : null}
            {priced ? <th>Line total</th> : null}
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td>
                <span className="gift-cell">
                  <GiftThumb thumb={thumbFor(thumbs, item)} name={item.name} />
                  <span>
                    {item.name}
                    {item.lineNote ? <span className="note">{item.lineNote}</span> : null}
                  </span>
                </span>
              </td>
              <td>
                {item.quantity.toLocaleString("en-IN")} {item.unit}
              </td>
              {priced ? <td>{item.unitPrice == null ? "—" : formatMoney(item.unitPrice, order.currency)}</td> : null}
              {priced ? <td>{item.lineTotal == null ? "—" : formatMoney(item.lineTotal, order.currency)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
      {priced ? (
        <div style={{ marginTop: 16 }}>
          {rows.map(([label, value]) => (
            <div className="sum" key={label}>
              <span>{label}</span>
              <b>{value}</b>
            </div>
          ))}
          <div className="sum">
            <span>Total</span>
            <b>{order.total == null ? "—" : formatMoney(order.total, order.currency)}</b>
          </div>
        </div>
      ) : null}
    </article>
  );
}
