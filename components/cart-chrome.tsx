"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { lineKey, useCart } from "@/components/cart-provider";
import { ArrowIcon, CloseIcon, GiftIcon, WhatsAppIcon } from "@/components/icons";
import { QuoteForm, type QuoteDraft } from "@/components/quote-form";
import { whatsAppHref } from "@/lib/site";

export function CartChrome() {
  const cart = useCart();
  const router = useRouter();
  const [draftGuests, setDraftGuests] = useState<number | null>(null);
  const [draft, setDraft] = useState<QuoteDraft | null>(null);
  const [sending, setSending] = useState(false);
  const guests = draftGuests ?? cart.guests;
  const onDraft = useCallback((next: QuoteDraft) => setDraft(next), []);
  const onBusy = useCallback((busy: boolean) => setSending(busy), []);

  const message = [
    "Hi Aamaira Gifts! Please share a quote:",
    "",
    ...cart.lines.map((line, index) => {
      const label = cart.labels[lineKey(line)];
      return `${index + 1}. ${label?.name ?? line.sku ?? "Gift"} — ${line.quantity} pcs`;
    }),
    "",
    `Total: ${cart.pieceCount} pieces`,
    draft?.occasion && `Occasion: ${draft.occasion}`,
    draft?.date && `Event date: ${draft.date}`,
    draft?.place && `Deliver to: ${draft.place}`,
    draft?.budget && `Budget/gift: ${draft.budget}`,
    draft?.packing ? "Gift packing: Yes" : "",
    draft?.namePrint ? "Name printing: Yes" : "",
    draft?.notes && `Notes: ${draft.notes}`,
    "",
    draft?.name && `— ${draft.name}${draft.phone ? ` (${draft.phone})` : ""}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");

  return (
    <>
      <div className={`scrim${cart.drawerOpen ? " open" : ""}`} onClick={() => cart.setDrawerOpen(false)} />
      <aside className={`drawer${cart.drawerOpen ? " open" : ""}`} aria-label="Quote list" aria-hidden={!cart.drawerOpen}>
        <div className="d-head">
          <div>
            <h3>Your quote list</h3>
            <p>
              {cart.itemCount
                ? `${cart.itemCount} gift${cart.itemCount === 1 ? "" : "s"} · ${cart.pieceCount.toLocaleString("en-IN")} pieces`
                : "Add gifts, then send for pricing"}
            </p>
          </div>
          <button className="x" type="button" aria-label="Close" onClick={() => cart.setDrawerOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        <div className="d-body">
          {cart.itemCount === 0 ? (
            <div className="d-empty">
              <div className="ic">
                <GiftIcon />
              </div>
              <b>Your list is empty</b>
              Tap “Request a quote” on any gift to start.
              <br />
              <br />
              <button className="add" type="button" onClick={() => cart.setDrawerOpen(false)}>
                Browse gifts
              </button>
            </div>
          ) : (
            <>
              <div className="d-guests">
                Set all quantities to
                <input
                  type="number"
                  min={1}
                  value={guests}
                  aria-label="Guests for every gift"
                  onChange={(event) => setDraftGuests(Math.max(1, Number(event.target.value) || 1))}
                />
                <button
                  type="button"
                  onClick={() => {
                    cart.applyGuests(guests);
                    setDraftGuests(null);
                  }}
                >
                  Apply
                </button>
              </div>
              {cart.lines.map((line) => {
                const key = lineKey(line);
                const label = cart.labels[key];
                return (
                  <div className="line" key={key}>
                    {label?.image ? (
                      <Image src={label.image} alt="" width={64} height={64} />
                    ) : (
                      <div style={{ width: 64, height: 64, borderRadius: 10, background: "var(--gold-50)" }} />
                    )}
                    <div>
                      <div className="nm">{label ? <Link href={`/products/${label.slug}`}>{label.name}</Link> : key}</div>
                      <div className="mt">{label ? `Min ${label.minQuantity}` : "Quantity"}</div>
                      <button className="rm" type="button" onClick={() => cart.remove(key)}>
                        Remove
                      </button>
                    </div>
                    <div className="qty">
                      <button
                        type="button"
                        aria-label="Decrease"
                        onClick={() => {
                          const step = line.quantity >= 100 ? 10 : 5;
                          const min = label?.minQuantity ?? 1;
                          const next = line.quantity - step;
                          cart.setQuantityFromKey(key, next < min ? 0 : next);
                        }}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={0}
                        aria-label="Quantity"
                        value={line.quantity}
                        onChange={(event) => cart.setQuantityFromKey(key, Number(event.target.value))}
                      />
                      <button type="button" aria-label="Increase" onClick={() => cart.setQuantityFromKey(key, line.quantity + (line.quantity >= 100 ? 10 : 5))}>
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
              <QuoteForm
                formId="quote-form"
                onDraft={onDraft}
                onBusy={onBusy}
                onSent={(result) => {
                  cart.clear();
                  const digits = result.phone.replace(/\D/g, "");
                  const phone = digits.length > 10 ? digits.slice(-10) : digits;
                  const params = new URLSearchParams();
                  if (phone) params.set("phone", phone);
                  if (result.number) params.set("number", result.number);
                  router.push(`/thanks?${params.toString()}`);
                }}
              />
            </>
          )}
        </div>
        {cart.itemCount > 0 ? (
          <div className="d-foot">
            <div className="sum">
              <span>Total pieces</span>
              <b>{cart.pieceCount.toLocaleString("en-IN")}</b>
            </div>
            <button className="btn-primary" type="submit" form="quote-form" disabled={sending}>
              {sending ? "Sending…" : "Send quote request"} {!sending ? <ArrowIcon /> : null}
            </button>
            <a className="btn-ghost-wa" href={whatsAppHref(message)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              Send list on WhatsApp
            </a>
            <div className="fine">No payment now. We&apos;ll confirm prices &amp; availability first.</div>
          </div>
        ) : null}
      </aside>
      <div className={`mbar${cart.itemCount > 0 ? " show" : ""}`}>
        <div className="t">
          <b>
            {cart.itemCount} gift{cart.itemCount === 1 ? "" : "s"} in list
          </b>
          <span>{cart.pieceCount.toLocaleString("en-IN")} pieces</span>
        </div>
        <button type="button" onClick={() => cart.setDrawerOpen(true)}>
          Send quote →
        </button>
      </div>
      <div className={`toast${cart.toast ? " show" : ""}`} role="status" aria-live="polite">
        <span>{cart.toast}</span>
        <button
          type="button"
          onClick={() => {
            cart.dismissToast();
            cart.setDrawerOpen(true);
          }}
        >
          View list
        </button>
      </div>
    </>
  );
}
