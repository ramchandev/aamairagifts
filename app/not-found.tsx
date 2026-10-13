import Link from "next/link";
import { getCatalog } from "@/lib/cofolo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That page is not on Aamaira Gifts. Search the return gifts or go back to the shop.",
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  let categories: { id: string; name: string; slug: string }[] = [];
  try {
    categories = (await getCatalog()).categories;
  } catch {
    categories = [];
  }

  return (
    <main className="wrap missing">
      <p className="eyebrow">404</p>
      <h1>We can’t find that page</h1>
      <p>The link may be old, or the gift may have a new name. Search the shop, or start from a category.</p>
      <form className="miss-search" action="/" method="get" role="search">
        <label className="sr-only" htmlFor="missing-q">
          Search gifts
        </label>
        <input id="missing-q" name="q" type="search" placeholder="Search diyas, dabbas, flasks, pouches…" autoComplete="off" />
        <button className="btn-primary" type="submit">
          Search
        </button>
      </form>
      {categories.length > 0 ? (
        <nav className="miss-cats" aria-label="Shop categories">
          {categories.map((category) => (
            <Link key={category.id} href={`/?category=${category.slug}`}>
              {category.name}
            </Link>
          ))}
        </nav>
      ) : null}
      <p className="miss-links">
        <Link href="/">All gifts</Link>
        <Link href="/track">Track an order</Link>
        <Link href="/shipping">Shipping</Link>
      </p>
    </main>
  );
}
