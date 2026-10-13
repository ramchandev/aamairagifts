import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { Suspense } from "react";
import { CartChrome } from "@/components/cart-chrome";
import { CartProvider } from "@/components/cart-provider";
import { GoogleAnalytics } from "@/components/google-analytics";
import { JsonLd } from "@/components/json-ld";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { HOME_TITLE, organizationLd, SITE_DESCRIPTION, siteUrl } from "@/lib/seo";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: HOME_TITLE,
    template: "%s — Aamaira Gifts",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Aamaira Gifts",
  authors: [{ name: "Aamaira Gifts", url: siteUrl() }],
  creator: "Aamaira Gifts",
  publisher: "Aamaira Gifts",
  category: "shopping",
  appleWebApp: { title: "aamairagifts.com" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Aamaira Gifts",
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={figtree.className} data-scroll-behavior="smooth">
      <body>
        <JsonLd data={organizationLd()} />
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>
        <a className="skip" href="#shop">
          Skip to gifts
        </a>
        <CartProvider>
          <div className="ribbon">
            <div className="wrap">
              <span>
                Return gifts from <b>25 pieces</b>
              </span>
              <span className="dot" />
              <span className="hide-xs">Free gift tags & thank-you cards</span>
              <span className="dot" />
              <span>
                Prices shared on <b>WhatsApp within 4 hours</b>
              </span>
            </div>
          </div>
          <Suspense fallback={<div className="site" style={{ height: 76 }} />}>
            <SiteHeader />
          </Suspense>
          {children}
          <Suspense fallback={null}>
            <SiteFooter />
          </Suspense>
          <CartChrome />
        </CartProvider>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
