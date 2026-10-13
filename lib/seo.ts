import { listProducts } from "@/lib/cofolo";
import { CONTACT_EMAIL, WHATSAPP_NUMBER } from "@/lib/site";
import type { Metadata } from "next";
import type { Product } from "@/lib/types";

const FALLBACK_SITE_URL = "https://www.aamairagifts.com";

export function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/^https?:\/\//, "")}`;
  return FALLBACK_SITE_URL;
}

export function absoluteUrl(path = "/") {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SITE_NAME = "Aamaira Gifts";
export const HOME_TITLE = "Return Gifts for Every Celebration — Aamaira Gifts";
export const SITE_DESCRIPTION =
  "Return gifts from Coimbatore for weddings, housewarmings, Golu, baby showers and corporate events. Request a quote and track the order here.";

export function metaText(value: string, max = 155) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > 80 ? cut.slice(0, space) : cut).replace(/[.,;:\s]+$/, "")}…`;
}

export function pageMeta({
  title,
  description,
  path,
  index = true,
  follow = true,
  absolute = false,
  image,
  imageAlt,
}: {
  title: string;
  description: string;
  path?: string;
  index?: boolean;
  follow?: boolean;
  absolute?: boolean;
  image?: string;
  imageAlt?: string;
}): Metadata {
  const branded = absolute ? title : `${title} — ${SITE_NAME}`;
  const text = metaText(description);
  return {
    title: absolute ? { absolute: title } : title,
    description: text,
    alternates: path ? { canonical: path } : undefined,
    robots: {
      index,
      follow,
      googleBot: index
        ? { index: true, follow, "max-image-preview": "large" as const, "max-snippet": -1, "max-video-preview": -1 }
        : { index: false, follow },
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: SITE_NAME,
      title: branded,
      description: text,
      url: path,
      images: image ? [{ url: image, alt: imageAlt || branded }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: branded,
      description: text,
    },
  };
}

export function categoryDescription(name: string, count?: number) {
  const stock = count ? `${count} designs` : "designs";
  return `${name} return gifts from Aamaira Gifts in Coimbatore. Browse ${stock} for weddings, housewarmings, Golu and other celebrations. Price on request.`;
}

export function productMetaDescription(product: Product) {
  const unit = product.minQuantity === 1 ? product.unit : product.unit === "piece" ? "pieces" : product.unit;
  const lead = (product.summary || product.description || "").replace(/\s+/g, " ").trim();
  const sentence = lead ? (/[.!?]$/.test(lead) ? lead : `${lead}.`) : "";
  return [sentence, `${product.name} return gift from Aamaira Gifts in Coimbatore.`, `Minimum ${product.minQuantity} ${unit}.`, "Price on request."].filter(Boolean).join(" ");
}

export const FAQS = [
  {
    question: "How do I order return gifts from Aamaira?",
    answer:
      "Add gifts to your list, set the guest count, and send a quote request with your name, WhatsApp number, email and pincode. We confirm the price on this website. You do not pay when you send the list. The full steps are on the How it works page.",
  },
  {
    question: "What is the minimum order?",
    answer: "Return-gift orders usually start at 25 pieces. Each gift page shows its own minimum quantity.",
  },
  {
    question: "When will I get the price?",
    answer: "We usually add prices within 4 hours on WhatsApp, and the same prices appear on your order page.",
  },
  {
    question: "Where do you deliver?",
    answer:
      "We deliver across India from Coimbatore, Tamil Nadu. The quote includes shipping once we have your pincode. Coimbatore orders are often ready the same week. Other cities follow the date we confirm.",
  },
  {
    question: "Can you print our names?",
    answer: "Yes, on selected flasks, boxes and gift tags. Tick “Print our names” when you request the quote.",
  },
  {
    question: "How do I track an order?",
    answer:
      "Open Track an order and enter the phone number used on the quote. You will see every order for that number, then the gifts, price, payment details and courier updates.",
  },
] as const;

export function organizationLd() {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OnlineStore",
        "@id": `${url}/#shop`,
        name: SITE_NAME,
        url,
        image: `${url}/opengraph-image`,
        logo: `${url}/aamaira-mark.png`,
        description: SITE_DESCRIPTION,
        email: CONTACT_EMAIL,
        telephone: `+${WHATSAPP_NUMBER}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Coimbatore",
          addressRegion: "Tamil Nadu",
          addressCountry: "IN",
        },
        areaServed: { "@type": "Country", name: "India" },
        currenciesAccepted: "INR",
        paymentAccepted: "Bank transfer, UPI",
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        name: SITE_NAME,
        url,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${url}/#shop` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${url}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export function faqLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productLd(product: Product) {
  const url = absoluteUrl(`/products/${product.slug}`);
  const images = product.images.map((image) => image.url).filter(Boolean);
  const description = product.summary || product.description || `${product.name} from ${SITE_NAME}. Price on request.`;
  const offer: Record<string, unknown> = {
    "@type": "Offer",
    url,
    priceCurrency: product.currency || "INR",
    availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    seller: { "@id": `${siteUrl()}/#shop` },
  };
  if (product.price != null && !product.priceOnRequest) offer.price = product.price;
  else offer.description = "Price on request. Ask Aamaira Gifts for a quote.";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description,
    sku: product.sku || undefined,
    image: images.length ? images : undefined,
    category: product.category?.name,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: offer,
  };
}

export async function allProducts() {
  const items: Product[] = [];
  let page = 1;
  while (page <= 20) {
    const result = await listProducts({ limit: 100, page });
    items.push(...result.items);
    if (!result.hasMore) break;
    page += 1;
  }
  return items;
}
