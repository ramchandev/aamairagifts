"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CartControls } from "@/components/cart-controls";
import { useCart } from "@/components/cart-provider";
import { CheckIcon } from "@/components/icons";
import { formatMoney } from "@/lib/money";
import { attr } from "@/lib/shop";
import type { Product } from "@/lib/types";

function badgeClass(badge: string) {
  if (badge === "Bestseller" || badge === "Premium") return "gold";
  if (badge === "Personalise") return "teal";
  return "";
}

export function PriceTag({ product }: { product: Pick<Product, "price" | "priceOnRequest" | "currency"> }) {
  if (product.priceOnRequest || product.price == null) {
    return <span className="por">Price on request</span>;
  }
  return <span className="price">{formatMoney(product.price, product.currency)}</span>;
}

export function ProductCard({ product }: { product: Product }) {
  const { lineFor, remember } = useCart();
  const [imageIndex, setImageIndex] = useState(0);
  useEffect(() => {
    remember(product);
  }, [remember, product]);
  const image = product.images[imageIndex] ?? product.images[0];
  const badge = attr(product, "Badge");
  const inCart = Boolean(lineFor(product));
  const meta = [product.summary, `Min ${product.minQuantity}`].filter(Boolean).join(" · ");

  return (
    <article className={`card${inCart ? " in-cart" : ""}`}>
      <Link href={`/products/${product.slug}`} className="card-link">
        <div className="thumb">
          {image ? (
            <Image src={image.url} alt={image.alt ?? product.name} fill sizes="(max-width: 720px) 45vw, 240px" />
          ) : null}
          {badge ? <span className={`badge ${badgeClass(badge)}`}>{badge}</span> : null}
          <span className="added-flag" aria-label="In your list">
            <CheckIcon />
          </span>
        </div>
      </Link>
      {product.images.length > 1 ? (
        <div className="variants">
          {product.images.slice(0, 4).map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`${product.name} photo ${index + 1}`}
              aria-pressed={index === imageIndex}
              onClick={() => setImageIndex(index)}
            >
              <Image src={item.url} alt="" fill sizes="34px" />
            </button>
          ))}
          {product.images.length > 4 ? <span className="more">+{product.images.length - 4}</span> : null}
        </div>
      ) : null}
      <div className="c-body">
        <h3 className="c-name">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="c-meta">{meta}</div>
        <div className="c-foot">
          {!product.inStock ? <span className="oos">Out of stock</span> : <PriceTag product={product} />}
          <span className="act">
            <CartControls product={product} />
          </span>
        </div>
      </div>
    </article>
  );
}
