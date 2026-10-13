"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

function todayInIndia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

export function PaymentClaim({ token }: { token: string }) {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [paidOn, setPaidOn] = useState(todayInIndia);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(token)}/payment`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reference, paidOn, note }),
      });
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setError(body?.message || "Could not send the payment reference. Please try again.");
        return;
      }
      setSent(true);
      router.refresh();
    } catch {
      setError("Could not send the payment reference. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return <p className="banner info">We&apos;ve passed your payment reference to the shop. The order stays here until the payment is confirmed.</p>;
  }

  return (
    <form className="pay-claim" onSubmit={onSubmit}>
      <b>I&apos;ve paid</b>
      {error ? (
        <div className="form-errors" role="alert">
          <p>{error}</p>
        </div>
      ) : null}
      <label className="fld">
        <span>UPI or bank reference</span>
        <input
          name="reference"
          value={reference}
          required
          maxLength={80}
          autoComplete="off"
          placeholder="UTR or UPI reference"
          onChange={(event) => setReference(event.target.value)}
        />
      </label>
      <label className="fld">
        <span>Paid on</span>
        <input type="date" name="paidOn" value={paidOn} onChange={(event) => setPaidOn(event.target.value)} />
      </label>
      <label className="fld">
        <span>Note</span>
        <input name="note" value={note} maxLength={500} placeholder="Optional" onChange={(event) => setNote(event.target.value)} />
      </label>
      <button className="btn-primary" type="submit" disabled={busy}>
        {busy ? "Sending…" : "I've paid"}
      </button>
    </form>
  );
}
