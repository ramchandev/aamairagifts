import { connection } from "next/server";
import { Suspense } from "react";
import { OrderList } from "@/components/order-list";
import { TrackForm } from "@/components/track-form";
import { CofoloError } from "@/lib/cofolo";
import { phoneDigits } from "@/lib/order-index";
import { ordersForPhone } from "@/lib/orders-by-phone";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ phone?: string }> }) {
  const { phone = "" } = await searchParams;
  return pageMeta({
    title: "Track an order",
    description: "Look up an Aamaira Gifts order with the phone number used on the quote. See the gifts, price, payment details and courier updates.",
    path: "/track",
    index: phone.trim().length === 0,
    follow: phone.trim().length === 0,
  });
}

export default function TrackPage({ searchParams }: { searchParams: Promise<{ phone?: string }> }) {
  return (
    <main className="wrap track-page">
      <Suspense fallback={<div className="skel" style={{ height: 180, maxWidth: 640 }} />}>
        <Tracker searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Tracker({ searchParams }: { searchParams: Promise<{ phone?: string }> }) {
  await connection();
  const { phone = "" } = await searchParams;
  const digits = phoneDigits(phone);
  if (!phone.trim()) return <TrackForm />;
  if (digits.length < 10) {
    return (
      <>
        <div className="form-errors" role="alert" style={{ maxWidth: 640 }}>
          <p>Enter the 10-digit phone number used on the order.</p>
        </div>
        <TrackForm phone={phone} />
      </>
    );
  }

  let found: Awaited<ReturnType<typeof ordersForPhone>> = { orders: [], hasMore: false };
  let problem = "";
  try {
    found = await ordersForPhone(phone);
  } catch (error) {
    problem = error instanceof CofoloError ? error.message : "Could not load the orders. Please try again.";
  }
  return (
    <>
      <TrackForm phone={phone} />
      {problem ? (
        <div className="form-errors" role="alert" style={{ maxWidth: 640 }}>
          <p>{problem}</p>
        </div>
      ) : found.orders.length === 0 ? (
        <div className="form-errors" role="alert" style={{ maxWidth: 760 }}>
          <p>No orders placed on this website were found for this phone number.</p>
        </div>
      ) : (
        <OrderList orders={found.orders} phone={digits} hasMore={found.hasMore} />
      )}
    </>
  );
}
