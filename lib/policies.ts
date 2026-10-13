import { CONTACT_EMAIL, WHATSAPP_DISPLAY } from "@/lib/site";

export type PolicyBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] };

export interface PolicySection {
  heading: string;
  blocks: PolicyBlock[];
}

export interface Policy {
  slug: "privacy" | "cookies" | "shipping" | "returns" | "terms";
  nav: string;
  title: string;
  description: string;
  sections: PolicySection[];
}

const updated = "13 October 2026";

export const POLICIES: Policy[] = [
  {
    slug: "privacy",
    nav: "Privacy",
    title: "Privacy policy",
    description: "What Aamaira Gifts collects when you request a quote or track an order, and how that information is used.",
    sections: [
      {
        heading: "Who we are",
        blocks: [
          {
            type: "p",
            text: `Aamaira Gifts is a return-gift shop in Coimbatore, Tamil Nadu. This policy covers aamairagifts.com. Questions: ${CONTACT_EMAIL} or WhatsApp ${WHATSAPP_DISPLAY}. Updated ${updated}.`,
          },
        ],
      },
      {
        heading: "What you send us",
        blocks: [
          {
            type: "p",
            text: "When you request a quote we receive your name, WhatsApp number, email, event date, occasion, pincode, budget, packing and name-print choices, notes, and the gifts and quantities on your list.",
          },
          {
            type: "p",
            text: "We keep the phone number with the order so you can look it up on Track an order. The order page then shows the status, price, payment details and courier updates from our shop system.",
          },
        ],
      },
      {
        heading: "What stays in your browser",
        blocks: [
          {
            type: "p",
            text: "Your quote list, guest count and the draft of the quote form stay in this browser until you send the request or clear the site data. We also store a single retry key so a double tap does not create a second order.",
          },
        ],
      },
      {
        heading: "How we use it",
        blocks: [
          {
            type: "list",
            items: [
              "To price the list, confirm the order and pack the gifts.",
              "To reply on WhatsApp or email.",
              "To pass the pincode and a contact number to the courier that delivers the parcel.",
              "To keep tax and order records we are required to hold.",
            ],
          },
          { type: "p", text: "We do not sell your details. We do not use them for advertising." },
        ],
      },
      {
        heading: "Your choices",
        blocks: [
          {
            type: "p",
            text: `Email ${CONTACT_EMAIL} or message us on WhatsApp if you want a correction, or if you want us to delete details we no longer need for an open order or a legal record.`,
          },
        ],
      },
    ],
  },
  {
    slug: "cookies",
    nav: "Cookies",
    title: "Cookie policy",
    description: "Aamaira Gifts does not use advertising or analytics cookies. The quote list is stored in your browser.",
    sections: [
      {
        heading: "No tracking cookies",
        blocks: [
          {
            type: "p",
            text: `This website does not set advertising cookies or analytics cookies. Updated ${updated}.`,
          },
        ],
      },
      {
        heading: "Storage the shop needs",
        blocks: [
          {
            type: "p",
            text: "The quote list has to survive a refresh, so the browser keeps a few values on this device:",
          },
          {
            type: "list",
            items: [
              "The gifts and quantities on your list.",
              "The guest count.",
              "A draft of the quote form, so you do not retype your name and pincode.",
              "A retry key for the quote you just sent, so a second tap does not place a second order.",
            ],
          },
          {
            type: "p",
            text: "Clearing this site’s data in the browser removes that list. It does not delete an order you have already sent.",
          },
        ],
      },
    ],
  },
  {
    slug: "shipping",
    nav: "Shipping",
    title: "Shipping policy",
    description: "Aamaira Gifts ships return gifts across India from Coimbatore. Shipping is confirmed with the quote.",
    sections: [
      {
        heading: "Where we ship",
        blocks: [
          {
            type: "p",
            text: `We pack in Coimbatore, Tamil Nadu, and deliver across India. The quote includes shipping after we have your pincode. Updated ${updated}.`,
          },
        ],
      },
      {
        heading: "When it leaves",
        blocks: [
          {
            type: "p",
            text: "Nothing is dispatched until the price is on the order and payment is confirmed. Coimbatore orders are often ready the same week. For other cities, the quote names the date we can hand the parcel to the courier.",
          },
          {
            type: "p",
            text: "Personalised names and large quantities can add time. If a date changes, we tell you on WhatsApp before we ship.",
          },
        ],
      },
      {
        heading: "Tracking",
        blocks: [
          {
            type: "p",
            text: "After handover, the order page from your email shows the courier name, tracking ID and a link to the courier page. Track an order finds the same page with the phone number from the quote.",
          },
        ],
      },
    ],
  },
  {
    slug: "returns",
    nav: "Returns",
    title: "Return policy",
    description: "How Aamaira Gifts handles a change before payment, a printing mistake, or a damaged delivery.",
    sections: [
      {
        heading: "Before you pay",
        blocks: [
          {
            type: "p",
            text: `A quote is not a finished order. You can change gifts, quantities or the pincode until you pay the price we add. Message ${WHATSAPP_DISPLAY} or email ${CONTACT_EMAIL}. Updated ${updated}.`,
          },
        ],
      },
      {
        heading: "Personalised gifts",
        blocks: [
          {
            type: "p",
            text: "Once a name or message is printed, those pieces cannot be returned unless we printed the wrong text. Check the spelling in your quote notes before you pay.",
          },
        ],
      },
      {
        heading: "Damage or a wrong item",
        blocks: [
          {
            type: "p",
            text: "If a parcel arrives damaged, short, or different from the confirmed order, tell us within 2 days of delivery. Send photos on WhatsApp or email. We replace that part or refund it. Shipping for a replacement we caused is on us.",
          },
        ],
      },
      {
        heading: "Change of mind",
        blocks: [
          {
            type: "p",
            text: "Packed return-gift sets are made for the guest count you gave us. If you need fewer pieces, ask before the order is packed. After dispatch, unopened non-personalised items are reviewed one order at a time. Return shipping is yours unless we made the error.",
          },
        ],
      },
    ],
  },
  {
    slug: "terms",
    nav: "Terms",
    title: "Terms and conditions",
    description: "The terms for requesting a quote and buying return gifts from Aamaira Gifts.",
    sections: [
      {
        heading: "A quote, then an order",
        blocks: [
          {
            type: "p",
            text: `You use this website to build a gift list and ask for a price. Sending the list does not take payment and does not reserve stock. The order is confirmed when we add the price and you pay it. Updated ${updated}.`,
          },
        ],
      },
      {
        heading: "Prices and quantities",
        blocks: [
          {
            type: "p",
            text: "Prices are shared on request. A figure is not your price until it appears on the order. Each gift shows a minimum quantity. Return-gift orders usually start at 25 pieces. We can decline a list we cannot pack in time.",
          },
        ],
      },
      {
        heading: "What you agree to send",
        blocks: [
          {
            type: "p",
            text: "The name, phone number, email and pincode you submit are the ones we use for the quote, payment reference and delivery. Photos and words on this website belong to Aamaira Gifts. Please do not copy the catalogue for another shop.",
          },
        ],
      },
      {
        heading: "Law",
        blocks: [
          {
            type: "p",
            text: "These terms follow the laws of India. Disputes are handled by the courts of Coimbatore, Tamil Nadu. Shipping, returns and privacy are part of these terms.",
          },
        ],
      },
    ],
  },
];

export function policyBySlug(slug: string) {
  return POLICIES.find((policy) => policy.slug === slug);
}
