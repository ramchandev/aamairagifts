"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { GiftIcon, SearchIcon, WhatsAppIcon } from "@/components/icons";
import { whatsAppHref } from "@/lib/site";

export function SiteHeader() {
  const params = useSearchParams();
  const cart = useCart();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const q = params.get("q") ?? "";
  const kept = ["category", "sort", "material", "personal", "useful"] as const;
  const itemCount = ready ? cart.itemCount : 0;
  const quoteLabel = !ready || cart.hasQuoteItem ? "Quote list" : "Cart";

  return (
    <header className="site">
      <div className="wrap hdr">
        <Link className="brand" href="/" aria-label="Aamaira Gifts home">
          <Image src="/aamaira-mark.png" alt="" width={50} height={54} priority />
          <span className="wm">
            <b>AAMAIRA</b>
            <span>RETURN GIFTS</span>
          </span>
        </Link>
        <form className="search" action="/" method="get" role="search">
          <span className="sr-only">Search gifts</span>
          {kept.flatMap((key) => params.getAll(key).map((value) => <input key={`${key}-${value}`} type="hidden" name={key} value={value} />))}
          <input key={q} name="q" type="search" placeholder="Search diyas, dabbas, flasks, pouches…" defaultValue={q} autoComplete="off" />
          <button type="submit" aria-label="Search">
            <SearchIcon />
          </button>
        </form>
        <div className="hdr-actions">
          <Link className="hlink hide-sm" href="/#how">
            How it works
          </Link>
          <Link className="hlink hide-sm" href="/track">
            Track order
          </Link>
          <a className="hlink hide-sm" href={whatsAppHref("Hi Aamaira Gifts! I need help choosing return gifts.")} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon />
            WhatsApp
          </a>
          <button className="cart-btn" type="button" onClick={() => cart.setDrawerOpen(true)} aria-label={`Open ${quoteLabel}`}>
            <GiftIcon />
            <span className="lbl">{quoteLabel}</span>
            <span className="count">{itemCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
