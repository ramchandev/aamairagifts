import { getCatalog } from "@/lib/cofolo";
import { POLICIES } from "@/lib/policies";
import { absoluteUrl, allProducts, SITE_DESCRIPTION } from "@/lib/seo";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY } from "@/lib/site";

export async function GET() {
  const [catalog, products] = await Promise.all([getCatalog(), allProducts()]);
  const lines = [
    "# Aamaira Gifts",
    "",
    `> ${SITE_DESCRIPTION} Prices are never guessed on this site. They appear only after we add them to the order.`,
    "",
    "## Shop",
    `- [All return gifts](${absoluteUrl("/")}): Browse the catalogue and request a quote.`,
    ...catalog.categories.map(
      (category) =>
        `- [${category.name}](${absoluteUrl(`/?category=${encodeURIComponent(category.slug)}`)}): ${category.productCount ?? 0} gifts.`,
    ),
    `- [Track an order](${absoluteUrl("/track")}): Look up orders with the phone number used on the quote. Quote emails open a private order page on this site. Do not invent an order number, a token, or a price.`,
    "",
    "## Policies",
    ...POLICIES.map((policy) => `- [${policy.title}](${absoluteUrl(`/${policy.slug}`)}): ${policy.description}`),
    "",
    "## Gifts",
    ...products.map((product) => {
      const summary = (product.summary || product.description || "Price on request.").replace(/\s+/g, " ").trim();
      return `- [${product.name}](${absoluteUrl(`/products/${product.slug}`)}): ${summary}`;
    }),
    "",
    "## Contact",
    `- WhatsApp: ${WHATSAPP_DISPLAY}`,
    `- Email: ${CONTACT_EMAIL}`,
    "- Place: Coimbatore, Tamil Nadu, India",
    "- Minimum: return-gift orders usually start at 25 pieces",
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
