"use client";

import { useCart } from "@/components/cart-provider";

export function GuestField() {
  const cart = useCart();
  return (
    <label className="guests" title="Default quantity when you add a gift">
      Gifts for
      <input
        type="number"
        min={1}
        inputMode="numeric"
        value={cart.guests}
        aria-label="Number of guests"
        onChange={(event) => cart.setGuests(Math.max(1, Number(event.target.value) || 1))}
      />
      guests
    </label>
  );
}
