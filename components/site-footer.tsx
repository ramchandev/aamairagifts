import Image from "next/image";
import Link from "next/link";
import { getCatalog } from "@/lib/cofolo";
import { POLICIES } from "@/lib/policies";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY, WHATSAPP_NUMBER, whatsAppHref } from "@/lib/site";

export async function SiteFooter() {
  const catalog = await getCatalog();
  const email = catalog.branding.contactEmail || CONTACT_EMAIL;
  const phone = catalog.branding.contactPhone || WHATSAPP_DISPLAY;

  return (
    <footer>
      <div className="wrap">
        <div className="f-grid">
          <div>
            <div className="f-brand">
              <Image src="/aamaira-mark.png" alt="" width={54} height={58} />
              <b>AAMAIRA</b>
            </div>
            <p style={{ margin: 0, maxWidth: 300 }}>
              Thoughtful return gifts for every Indian celebration — sourced, packed and delivered with care.
            </p>
          </div>
          <div>
            <h5>Shop</h5>
            <ul>
              {catalog.categories.map((category) => (
                <li key={category.id}>
                  <Link href={`/?category=${category.slug}`}>{category.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5>Help</h5>
            <ul>
              <li>
                <Link href="/#how">How ordering works</Link>
              </li>
              <li>
                <Link href="/track">Track an order</Link>
              </li>
              <li>
                <a href={whatsAppHref("Hi Aamaira Gifts! I'd like to ask about a bulk order.")} target="_blank" rel="noopener noreferrer">
                  Bulk & corporate orders
                </a>
              </li>
              <li>
                <Link href="/shipping">Shipping</Link>
              </li>
              <li>
                <Link href="/returns">Returns</Link>
              </li>
            </ul>
          </div>
          <div>
            <h5>Talk to us</h5>
            <ul>
              <li>
                <a href={whatsAppHref("Hi Aamaira Gifts!")} target="_blank" rel="noopener noreferrer">
                  WhatsApp: {phone}
                </a>
              </li>
              <li>
                <a href={`tel:+${WHATSAPP_NUMBER}`}>{phone}</a>
              </li>
              <li>
                <a href={`mailto:${email}`}>{email}</a>
              </li>
              <li>Coimbatore, Tamil Nadu</li>
            </ul>
          </div>
        </div>
        <div className="f-bottom">
          <span>© 2026 Aamaira Gifts. All rights reserved.</span>
          <nav className="f-legal" aria-label="Policies">
            {POLICIES.map((policy) => (
              <Link key={policy.slug} href={`/${policy.slug}`}>
                {policy.nav}
              </Link>
            ))}
          </nav>
          <span>
            Website design by{" "}
            <a href="https://www.bizysite.in" target="_blank" rel="nofollow noreferrer noopener" style={{ color: "var(--gold-500)", fontWeight: 600 }}>
              Bizy Site
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
