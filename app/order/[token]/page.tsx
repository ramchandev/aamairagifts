import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OrderView } from "@/components/order-view";
import { TrackForm } from "@/components/track-form";
import { CofoloError, trackOrder } from "@/lib/cofolo";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Your order",
  description: "Order status, gifts, price, payment details and courier updates from Aamaira Gifts.",
  index: false,
  follow: false,
});

export default function OrderTokenPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ phone?: string }>;
}) {
  return (
    <main className="wrap track-page">
      <Suspense fallback={<div className="skel" style={{ height: 280, maxWidth: 760 }} />}>
        <Ordered params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Ordered({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ phone?: string }> }) {
  await connection();
  const [{ token: raw }, query] = await Promise.all([params, searchParams]);
  const backHref = query.phone ? `/track?phone=${encodeURIComponent(query.phone)}` : "/track";
  const token = decodeURIComponent(raw).trim();
  if (!token || token.length > 128 || /[\\/]/.test(token)) notFound();
  let missed: "missing" | "wait" | null = null;
  let waitMessage = "";
  let order: Awaited<ReturnType<typeof trackOrder>>["order"] | null = null;
  try {
    order = (await trackOrder(token)).order;
  } catch (error) {
    if (error instanceof CofoloError && (error.status === 404 || error.status === 400)) missed = "missing";
    else if (error instanceof CofoloError && error.status === 429) {
      missed = "wait";
      waitMessage = error.message;
    } else throw error;
  }
  if (missed === "missing") {
    return (
      <>
        <div className="form-errors" role="alert" style={{ maxWidth: 640 }}>
          <p>We couldn&apos;t find an order with that link. Open the link from your email, or look it up with your phone number.</p>
        </div>
        <TrackForm />
      </>
    );
  }
  if (missed === "wait") {
    return (
      <>
        <div className="form-errors" role="alert" style={{ maxWidth: 640 }}>
          <p>{waitMessage}</p>
        </div>
        <TrackForm />
      </>
    );
  }
  if (!order) notFound();
  return <OrderView order={order} backHref={backHref} token={token} />;
}
