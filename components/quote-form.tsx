"use client";

import { useCallback, useEffect, useState } from "react";
import { lineKey, useCart, type CartLine } from "@/components/cart-provider";
import { OCCASIONS } from "@/lib/site";

export interface QuoteDraft {
  name: string;
  email: string;
  phone: string;
  date: string;
  occasion: string;
  place: string;
  budget: string;
  packing: boolean;
  namePrint: boolean;
  notes: string;
}

const EMPTY: QuoteDraft = {
  name: "",
  email: "",
  phone: "",
  date: "",
  occasion: "",
  place: "",
  budget: "",
  packing: true,
  namePrint: false,
  notes: "",
};

const FORM_KEY = "aamaira-quote-form";
const IDEM_KEY = "aamaira-idem";

function signature(lines: CartLine[]) {
  return lines
    .map((line) => `${lineKey(line)}:${line.quantity}`)
    .sort()
    .join("|");
}

function checkoutId(sig: string) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(IDEM_KEY) || "null") as { signature?: string; id?: string } | null;
    if (saved?.id && saved.signature === sig) return saved.id;
  } catch {
    /* start a new attempt */
  }
  const id = crypto.randomUUID();
  sessionStorage.setItem(IDEM_KEY, JSON.stringify({ signature: sig, id }));
  return id;
}

function notesFor(draft: QuoteDraft, guests: number, pieces: number) {
  return [
    draft.occasion && `Occasion: ${draft.occasion}`,
    draft.date && `Event date: ${draft.date}`,
    draft.place && `Deliver to: ${draft.place}`,
    draft.budget && `Budget per gift: ${draft.budget}`,
    `Guest count: ${guests}`,
    `Total pieces: ${pieces}`,
    draft.packing ? "Gift packing with thank-you tag: Yes" : "",
    draft.namePrint ? "Print names on tags / items: Yes" : "",
    draft.notes.trim(),
  ]
    .filter(Boolean)
    .join("\n");
}

function readDraft(): QuoteDraft {
  try {
    return { ...EMPTY, ...(JSON.parse(localStorage.getItem(FORM_KEY) || "null") as Partial<QuoteDraft> | null) };
  } catch {
    return EMPTY;
  }
}

export function QuoteForm({
  formId,
  onDraft,
  onBusy,
  onSent,
}: {
  formId: string;
  onDraft: (draft: QuoteDraft) => void;
  onBusy: (busy: boolean) => void;
  onSent: (result: { token: string; number: string; phone: string }) => void;
}) {
  const cart = useCart();
  const [draft, setDraft] = useState<QuoteDraft>(EMPTY);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState(false);
  const [retryIn, setRetryIn] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setDraft(readDraft()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    onDraft(draft);
  }, [draft, onDraft]);

  useEffect(() => {
    onBusy(pending || retryIn > 0);
  }, [pending, retryIn, onBusy]);

  useEffect(() => {
    if (retryIn <= 0) return;
    const timer = window.setTimeout(() => setRetryIn((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [retryIn]);

  const update = useCallback((patch: Partial<QuoteDraft>) => {
    setDraft((current) => {
      const next = { ...current, ...patch };
      localStorage.setItem(FORM_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (pending || retryIn > 0) return;
    const problems: string[] = [];
    const fields: Record<string, boolean> = {};
    if (draft.name.trim().length < 2) {
      problems.push("Please add your name.");
      fields.name = true;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
      problems.push("Please add your email. We send the quote there.");
      fields.email = true;
    }
    if (draft.phone.replace(/\D/g, "").length < 10) {
      problems.push("Please add a WhatsApp number.");
      fields.phone = true;
    }
    const postal = draft.place.replace(/\D/g, "");
    if (!/^\d{6}$/.test(postal)) {
      problems.push("Add a 6-digit pincode.");
      fields.place = true;
    }
    if (cart.lines.length === 0) problems.push("Add at least one gift.");
    if (website) problems.push("Could not send the quote.");
    setFieldErrors(fields);
    setErrors(problems);
    if (problems.length) {
      form.scrollIntoView({ block: "nearest" });
      return;
    }

    setPending(true);
    setErrors([]);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          checkoutId: checkoutId(signature(cart.lines)),
          website,
          notes: notesFor(draft, cart.guests, cart.pieceCount),
          customer: { name: draft.name.trim(), email: draft.email.trim(), phone: draft.phone.trim() },
          place: draft.place.replace(/\D/g, ""),
          cart: cart.lines.map((line) => ({ sku: line.sku, productId: line.productId, quantity: line.quantity })),
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        token?: string;
        number?: string;
        message?: string;
        details?: string[];
        retryAfter?: number;
      } | null;
      if (!response.ok || !result?.token) {
        const wait = Number(result?.retryAfter ?? response.headers.get("Retry-After") ?? 0);
        if (response.status === 429 && wait > 0) setRetryIn(wait);
        const details = result?.details?.length ? result.details : [result?.message || "Could not send the quote. Please try again."];
        setErrors(details);
        setFieldErrors({
          name: details.some((line) => /customer\.name/i.test(line)),
          email: details.some((line) => /email/i.test(line)),
          phone: details.some((line) => /phone/i.test(line)),
          place: details.some((line) => /address|city|postal|shipping/i.test(line)),
        });
        form.scrollIntoView({ block: "nearest" });
        return;
      }
      sessionStorage.removeItem(IDEM_KEY);
      onSent({ token: result.token, number: result.number ?? "", phone: draft.phone.trim() });
    } catch {
      setErrors(["Could not reach the shop. Please try again."]);
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="form-card" id={formId} onSubmit={submit} noValidate>
      <h4>Where should we send your quote?</h4>
      <p className="sub">We usually reply on WhatsApp within 4 hours.</p>
      {errors.length > 0 ? (
        <div className="form-errors" role="alert">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}
      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
      </div>
      <div className="fgrid">
        <div className={`fld${fieldErrors.name ? " err" : ""}`}>
          <label htmlFor="fName">
            Your name <i>*</i>
          </label>
          <input id="fName" name="name" autoComplete="name" value={draft.name} onChange={(event) => update({ name: event.target.value })} />
        </div>
        <div className={`fld${fieldErrors.phone ? " err" : ""}`}>
          <label htmlFor="fPhone">
            WhatsApp number <i>*</i>
          </label>
          <input id="fPhone" name="phone" type="tel" inputMode="tel" placeholder="+91" autoComplete="tel" value={draft.phone} onChange={(event) => update({ phone: event.target.value })} />
        </div>
        <div className={`fld full${fieldErrors.email ? " err" : ""}`}>
          <label htmlFor="fEmail">
            Email <i>*</i>
          </label>
          <input id="fEmail" name="email" type="email" autoComplete="email" value={draft.email} onChange={(event) => update({ email: event.target.value })} />
        </div>
        <div className="fld">
          <label htmlFor="fDate">Event date</label>
          <input id="fDate" name="date" type="date" value={draft.date} onChange={(event) => update({ date: event.target.value })} />
        </div>
        <div className="fld">
          <label htmlFor="fOcc">Occasion</label>
          <select id="fOcc" name="occ" value={draft.occasion} onChange={(event) => update({ occasion: event.target.value })}>
            <option value="">Select</option>
            {OCCASIONS.map((occasion) => (
              <option key={occasion}>{occasion}</option>
            ))}
          </select>
        </div>
        <div className={`fld${fieldErrors.place ? " err" : ""}`}>
          <label htmlFor="fPin">
            Pincode <i>*</i>
          </label>
          <input
            id="fPin"
            name="postal"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            placeholder="641001"
            value={draft.place}
            onChange={(event) => update({ place: event.target.value.replace(/\D/g, "").slice(0, 6) })}
          />
        </div>
        <div className="fld">
          <label htmlFor="fBudget">Budget per gift (optional)</label>
          <input id="fBudget" name="budget" placeholder="e.g. ₹100–150" value={draft.budget} onChange={(event) => update({ budget: event.target.value })} />
        </div>
        <div className="fld full opts">
          <label className="chk">
            <input type="checkbox" name="pack" checked={draft.packing} onChange={(event) => update({ packing: event.target.checked })} />
            Gift packing with thank-you tag
          </label>
          <label className="chk">
            <input type="checkbox" name="name_print" checked={draft.namePrint} onChange={(event) => update({ namePrint: event.target.checked })} />
            Print our names on tags / items
          </label>
        </div>
        <div className="fld full">
          <label htmlFor="fNotes">Anything else?</label>
          <textarea id="fNotes" name="notes" placeholder="Colours, mix of designs, delivery time…" value={draft.notes} onChange={(event) => update({ notes: event.target.value })} />
        </div>
      </div>
      <button type="submit" hidden disabled={pending || retryIn > 0}>
        {pending ? "Sending…" : "Send quote request"}
      </button>
    </form>
  );
}
