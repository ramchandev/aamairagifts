import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { FilterButton, FiltersAside, FiltersProvider } from "@/components/filters-shell";
import { GuestField } from "@/components/guest-field";
import { ProductGrid } from "@/components/product-grid";
import { SortSelect } from "@/components/sort-select";
import { WhatsAppIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { getCatalog, listProducts } from "@/lib/cofolo";
import { loadShop } from "@/lib/load-shop";
import { categoryDescription, FAQS, faqLd, HOME_TITLE, pageMeta, SITE_DESCRIPTION } from "@/lib/seo";
import { attr, parseShopQuery, shopHref, toggleMaterial, type ShopQuery } from "@/lib/shop";
import { whatsAppHref } from "@/lib/site";
import type { Metadata } from "next";
import type { Category, Product } from "@/lib/types";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const query = parseShopQuery(await searchParams);
  const filtered = Boolean(query.q || query.materials.length || query.personal || query.useful || query.sort !== "default" || query.page > 1);
  const canonical = query.category ? `/?category=${encodeURIComponent(query.category)}` : "/";
  if (query.q) {
    const term = query.q.slice(0, 60);
    return pageMeta({
      title: `Results for “${term}” — Aamaira Gifts`,
      description: `Return gifts matching “${term}” at Aamaira Gifts in Coimbatore.`,
      path: canonical,
      absolute: true,
      index: false,
      follow: true,
    });
  }
  if (query.category) {
    const catalog = await getCatalog();
    const category = catalog.categories.find((item) => item.slug === query.category);
    if (category) {
      return pageMeta({
        title: `${category.name} return gifts — Aamaira Gifts`,
        description: categoryDescription(category.name, category.productCount),
        path: canonical,
        absolute: true,
        index: !filtered,
      });
    }
  }
  return pageMeta({
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    path: "/",
    absolute: true,
    index: !filtered,
  });
}

export default function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <main>
      <Suspense fallback={<ShopFallback />}>
        <HomeShop searchParams={searchParams} />
      </Suspense>
      <TrustStrip />
      <Faq />
    </main>
  );
}

async function HomeShop({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = parseShopQuery(await searchParams);
  const [catalog, shop, hero] = await Promise.all([getCatalog(), loadShop(query), listProducts({ limit: 12 })]);
  const activeCategory = catalog.categories.find((category) => category.slug === query.category);
  const title = query.q ? `Results for “${query.q}”` : activeCategory?.name ?? "All return gifts";
  const heroPhotos = hero.items.filter((product) => product.images[0]).slice(0, 3);
  const allCount = catalog.categories.reduce((sum, category) => sum + (category.productCount ?? 0), 0);
  const materials = materialCounts(shop.facetItems);

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="hero-card">
            <div className="hero-txt">
              <span className="eyebrow">Return gifts, made simple</span>
              <h1>
                {activeCategory ? `${activeCategory.name} return gifts` : "Return gifts for every celebration."}
                <br />
                <em>We&apos;ll send you the best price.</em>
              </h1>
              <p>Handpicked return gifts for housewarmings, weddings, Golu, baby showers and every celebration in between.</p>
              <div className="steps" id="how">
                <span className="step">
                  <i>1</i>Add gifts to your list
                </span>
                <span className="step">
                  <i>2</i>Set guest count
                </span>
                <span className="step">
                  <i>3</i>Get a quote on WhatsApp
                </span>
              </div>
              <Link className="how-jump" href="/how-it-works">
                How it works
              </Link>
            </div>
            <div className="hero-imgs">
              {heroPhotos.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="hero-shot">
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt ?? product.name}
                    fill
                    sizes="200px"
                    priority
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="occ" aria-label="Shop by category">
        <div className="wrap">
          <div className="occ-row">
            <Link className="occ-chip" href={shopHref(query, { category: "" })} aria-current={query.category === "" ? "page" : undefined}>
              All gifts
            </Link>
            {catalog.categories.map((category) => (
              <Link
                key={category.id}
                className="occ-chip"
                href={shopHref(query, { category: category.slug })}
                aria-current={query.category === category.slug ? "page" : undefined}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {!catalog.acceptingOrders ? (
        <div className="wrap" style={{ paddingTop: 12 }}>
          <div className="banner">We’re not taking new orders right now. You can still browse the collection.</div>
        </div>
      ) : null}

      <FiltersProvider>
        <div className="wrap shop" id="shop">
          <FiltersAside>
            <CategoryList categories={catalog.categories} query={query} allCount={allCount} />
            <MaterialList materials={materials} query={query} />
            <div className="f-group">
              <h4>Good to have</h4>
              <Link className="chk" href={shopHref(query, { personal: !query.personal })} aria-current={query.personal ? "true" : undefined}>
                <span className={`tick${query.personal ? " on" : ""}`} aria-hidden="true" />
                Name personalisation
              </Link>
              <Link className="chk" href={shopHref(query, { useful: !query.useful })} aria-current={query.useful ? "true" : undefined}>
                <span className={`tick${query.useful ? " on" : ""}`} aria-hidden="true" />
                Everyday-use gifts
              </Link>
            </div>
            <div className="help-card">
              <b>Not sure what to pick?</b>
              <p>Share your budget and guest count — we&apos;ll suggest a set that fits.</p>
              <a className="btn-wa" href={whatsAppHref("Hi Aamaira Gifts! I need help choosing return gifts.")} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon fill="#fff" />
                Chat with us
              </a>
            </div>
          </FiltersAside>

          <section aria-labelledby="listTitle">
            <div className="crumb">
              <Link href="/">Home</Link> / <span>{title}</span>
            </div>
            <div className="list-head">
              <h2 id="listTitle">{title}</h2>
            </div>
            <div className="toolbar">
              <span className="shown">
                {shop.total === 0 ? "Showing 0 gifts" : `${shop.total} gift${shop.total === 1 ? "" : "s"}`}
              </span>
              <FilterButton />
              <GuestField />
              <SortSelect query={query} />
            </div>
            <ActiveChips query={query} />
            {shop.truncated ? <p className="c-meta">More gifts are in the catalogue than this page can filter at once.</p> : null}
            {shop.items.length === 0 ? (
              <div className="grid">
                <div className="empty">
                  <b>No gifts match these filters</b>
                  Try another category or clear the filters.
                  <br />
                  <br />
                  <Link className="add" href="/">
                    Clear all filters
                  </Link>
                </div>
              </div>
            ) : (
              <ProductGrid
                key={`${query.category}|${query.q}|${query.sort}|${query.materials.join()}|${query.personal}|${query.useful}`}
                products={shop.items}
              />
            )}
          </section>
        </div>
      </FiltersProvider>
    </>
  );
}

function CategoryList({ categories, query, allCount }: { categories: Category[]; query: ShopQuery; allCount: number }) {
  const items = [{ id: "all", name: "All return gifts", slug: "", productCount: allCount }, ...categories];
  return (
    <div className="f-group" style={{ paddingTop: 0 }}>
      <h4>Category</h4>
      <ul className="cat-list">
        {items.map((category) => {
          const current = query.category === category.slug;
          return (
            <li key={category.id}>
              <Link href={shopHref(query, { category: category.slug })} aria-current={current ? "page" : undefined}>
                {category.name}
                <span className="n">{category.productCount ?? 0}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function materialCounts(items: Product[]) {
  const counts = new Map<string, number>();
  for (const product of items) {
    const material = attr(product, "Material");
    if (!material) continue;
    counts.set(material, (counts.get(material) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function MaterialList({ materials, query }: { materials: [string, number][]; query: ShopQuery }) {
  if (materials.length === 0) return null;
  return (
    <div className="f-group">
      <h4>Material</h4>
      {materials.map(([material, count]) => (
        <Link key={material} className="chk" href={shopHref(query, { materials: toggleMaterial(query.materials, material) })} aria-current={query.materials.includes(material) ? "true" : undefined}>
          <span className={`tick${query.materials.includes(material) ? " on" : ""}`} aria-hidden="true" />
          {material}
          <span className="c">{count}</span>
        </Link>
      ))}
    </div>
  );
}

function ActiveChips({ query }: { query: ShopQuery }) {
  const chips: { href: string; label: string }[] = [];
  if (query.q) chips.push({ href: shopHref(query, { q: "" }), label: `Search: ${query.q}` });
  for (const material of query.materials) {
    chips.push({ href: shopHref(query, { materials: query.materials.filter((item) => item !== material) }), label: `Material: ${material}` });
  }
  if (query.personal) chips.push({ href: shopHref(query, { personal: false }), label: "Personalisation" });
  if (query.useful) chips.push({ href: shopHref(query, { useful: false }), label: "Everyday use" });
  if (chips.length === 0) return null;
  return (
    <div className="active-chips" style={{ marginBottom: 18 }}>
      {chips.map((chip) => (
        <Link key={chip.label} className="achip" href={chip.href}>
          {chip.label}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </Link>
      ))}
      <Link className="clear-all" href={query.category ? shopHref(query, { q: "", materials: [], personal: false, useful: false }) : "/"}>
        Clear all filters
      </Link>
    </div>
  );
}

function TrustStrip() {
  return (
    <section className="trust" aria-label="Why Aamaira">
      <div className="wrap">
        <div className="t-item">
          <div className="t-ic">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M20 12V22H4V12M22 7H2v5h20V7ZM12 22V7" />
            </svg>
          </div>
          <div>
            <b>Gift-ready packing</b>
            <span>Bags, tags & thank-you cards included</span>
          </div>
        </div>
        <div className="t-item">
          <div className="t-ic">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </div>
          <div>
            <b>Name personalisation</b>
            <span>On flasks, boxes and tags</span>
          </div>
        </div>
        <div className="t-item">
          <div className="t-ic">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 7h13v10H3zM16 10h4l1 3v4h-5" />
              <circle cx="7" cy="18" r="2" />
              <circle cx="17" cy="18" r="2" />
            </svg>
          </div>
          <div>
            <b>Delivered across India</b>
            <span>Coimbatore same-week on most items</span>
          </div>
        </div>
        <div className="t-item">
          <div className="t-ic">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 8v4l3 2" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </div>
          <div>
            <b>Quote in 4 hours</b>
            <span>Best price for your quantity</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="faq" aria-labelledby="faq-title">
      <JsonLd data={faqLd()} />
      <div className="wrap">
        <h2 id="faq-title">Questions before you order</h2>
        {FAQS.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function ShopFallback() {
  return (
    <div className="shop-fallback wrap">
      <div className="skel" style={{ height: 260, marginTop: 28 }} />
      <div className="grid skel-grid" style={{ marginTop: 28 }}>
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="skel" style={{ height: 320 }} />
        ))}
      </div>
    </div>
  );
}
