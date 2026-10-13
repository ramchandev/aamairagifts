import Link from "next/link";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "How it works",
  description:
    "How to order return gifts from Aamaira Gifts: choose gifts, send a quote, get the price, pay, and track the order with your phone number.",
  path: "/how-it-works",
});

const STEPS = [
  {
    title: "Choose the gifts",
    text: "Browse the shop or search by name. Open a gift to see the photos, the minimum quantity, and whether a name can be printed.",
  },
  {
    title: "Set the guest count",
    text: "The guest count becomes the quantity for each gift you add. You can change any quantity. Most return-gift orders start at 25 pieces, and each gift shows its own minimum.",
  },
  {
    title: "Send the quote",
    text: "Add your name, WhatsApp number, email, and a 6-digit pincode. Event date, occasion, budget, gift packing, and name printing help us prepare the quote. You do not pay at this step.",
  },
  {
    title: "We send the price",
    text: "We usually reply on WhatsApp within 4 hours. The same amount appears on your order page, with the UPI QR, UPI id, and bank details.",
  },
  {
    title: "Pay, then we confirm",
    text: "Pay the amount on the order page, then enter the UPI or bank reference and tap I've paid. We check that the payment has arrived before anything is packed or printed.",
  },
  {
    title: "We ship, and you follow it",
    text: "Coimbatore orders are often ready the same week. For other cities, the quote names the date we can hand the parcel to the courier. Track an order with the phone number from the quote to see the status, gifts, and courier details. The email we send opens the same order.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="wrap track-page">
      <article className="how">
        <p className="eyebrow">How it works</p>
        <h1>From gift list to delivery</h1>
        <p className="how-lead">You do not pay when you send the list. We confirm the price, you pay, and then we pack and ship.</p>
        <ol className="how-steps">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <i>{index + 1}</i>
              <div>
                <h2>{step.title}</h2>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="how-actions">
          <Link className="btn-primary" href="/">
            Browse gifts
          </Link>
          <Link className="btn-line" href="/track">
            Track an order
          </Link>
        </div>
      </article>
    </main>
  );
}
