"use client";

import { useCart } from "@/components/cart-provider";
import { PlusIcon } from "@/components/icons";
import type { Product } from "@/lib/types";

function stepFor(quantity: number) {
  return quantity >= 100 ? 10 : 5;
}

export function CartControls({ product, large = false }: { product: Product; large?: boolean }) {
  const cart = useCart();
  const line = cart.lineFor(product);
  const min = product.minQuantity || 1;

  if (!product.inStock) {
    return <span className="oos">Out of stock</span>;
  }

  if (!line) {
    const label = product.priceOnRequest || product.price == null ? "Request a quote" : "Add to cart";
    return (
      <button className="btn-quote" type="button" onClick={() => cart.add(product)}>
        {label} <PlusIcon />
      </button>
    );
  }

  function change(next: number) {
    if (next > 0 && next < min) {
      cart.setQuantity(product, min);
      return;
    }
    cart.setQuantity(product, next);
  }

  const step = stepFor(line.quantity);
  return (
    <div className="qty" data-large={large || undefined}>
      <button
        type="button"
        aria-label={`Decrease ${product.name}`}
        onClick={() => change(line.quantity - step < min ? 0 : line.quantity - step)}
      >
        −
      </button>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        aria-label={`Quantity for ${product.name}`}
        value={line.quantity}
        onChange={(event) => change(Number(event.target.value))}
      />
      <button
        type="button"
        aria-label={`Increase ${product.name}`}
        onClick={() => change(line.quantity + step)}
      >
        +
      </button>
    </div>
  );
}
