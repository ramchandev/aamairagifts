"use client";

import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";

const STEP = 12;

export function ProductGrid({ products }: { products: Product[] }) {
  const [shown, setShown] = useState(STEP);
  const sentinel = useRef<HTMLDivElement>(null);
  const hasMore = shown < products.length;

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown((count) => Math.min(products.length, count + STEP));
        }
      },
      { rootMargin: "700px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, products.length]);

  return (
    <>
      <div className="grid">
        {products.slice(0, shown).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {hasMore ? <div ref={sentinel} className="load-more" aria-hidden="true" /> : null}
    </>
  );
}
