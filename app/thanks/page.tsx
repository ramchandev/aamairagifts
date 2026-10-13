import { connection } from "next/server";
import Link from "next/link";
import { Suspense } from "react";
import { phoneDigits } from "@/lib/order-index";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Quote sent",
  description: "Your Aamaira Gifts quote has been sent. Continue shopping or track the order with your phone number.",
  path: "/thanks",
  index: false,
  follow: false,
});

export default function ThanksPage({ searchParams }: { searchParams: Promise<{ phone?: string; number?: string }> }) {
  return (
    <main className="wrap track-page">
      <Suspense fallback={<div className="skel" style={{ height: 220, maxWidth: 640 }} />}>
        <Thanks searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Thanks({ searchParams }: { searchParams: Promise<{ phone?: string; number?: string }> }) {
  await connection();
  const query = await searchParams;
  const digits = phoneDigits(query.phone ?? "");
  const number = /^ORD-\d+$/.test(query.number ?? "") ? query.number : "";
  const trackHref = digits.length >= 10 ? `/track?phone=${digits}` : "/track";

  return (
    <article className="thanks">
      <p className="eyebrow">Quote sent</p>
      <h1>Thank you</h1>
      <p>
        {number ? `${number} is with us. ` : "Your quote is with us. "}
        We&apos;ll reply on WhatsApp with prices. You can keep shopping, or look this quote up later with your phone number.
      </p>
      <div className="thanks-actions">
        <Link className="btn-primary" href="/">
          Continue shopping
        </Link>
        <Link className="btn-line" href={trackHref}>
          Track order
        </Link>
      </div>
    </article>
  );
}
