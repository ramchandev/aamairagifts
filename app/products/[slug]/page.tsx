import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CartControls } from "@/components/cart-controls";
import { PriceTag, ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { JsonLd } from "@/components/json-ld";
import { CofoloError, getProduct, listProducts } from "@/lib/cofolo";
import { breadcrumbLd, productLd } from "@/lib/seo";
import { attr, isYes } from "@/lib/shop";
import type { Metadata } from "next";
import type { Product } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProduct(slug);
    const description =
      product.summary ||
      product.description ||
      `${product.name} return gift from Aamaira Gifts in Coimbatore. Price on request. Minimum ${product.minQuantity} ${product.unit}.`;
    const image = product.images[0];
    return {
      title: product.name,
      description,
      alternates: { canonical: `/products/${product.slug}` },
      openGraph: {
        title: product.name,
        description,
        url: `/products/${product.slug}`,
        images: image ? [{ url: image.url, alt: image.alt || product.name }] : undefined,
      },
    };
  } catch {
    return { title: "Gift" };
  }
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="wrap product-page"><div className="skel" style={{ height: 520 }} /></div>}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product: Product;
  try {
    product = await getProduct(slug);
  } catch (error) {
    if (error instanceof CofoloError && error.status === 404) notFound();
    throw error;
  }

  const related = product.category
    ? (await listProducts({ category: product.category.slug, limit: 8 })).items.filter((item) => item.id !== product.id).slice(0, 4)
    : [];
  const badge = attr(product, "Badge");
  const material = attr(product, "Material");

  const crumbs = [
    { name: "Home", path: "/" },
    ...(product.category ? [{ name: product.category.name, path: `/?category=${product.category.slug}` }] : []),
    { name: product.name, path: `/products/${product.slug}` },
  ];

  return (
    <main className="wrap product-page">
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={productLd(product)} />
      <div className="crumb">
        <Link href="/">Home</Link>
        {product.category ? (
          <>
            {" / "}
            <Link href={`/?category=${product.category.slug}`}>{product.category.name}</Link>
          </>
        ) : null}
        {" / "}
        <span>{product.name}</span>
      </div>
      <div className="product-panel">
        <ProductGallery images={product.images} name={product.name} />
        <div className="lb-info">
          <div className="lb-cat">{product.category?.name}</div>
          <h1>{product.name}</h1>
          {product.summary ? <p>{product.summary}</p> : null}
          {product.description ? <p>{product.description}</p> : null}
          <dl className="specs">
            {material ? (
              <>
                <dt>Material</dt>
                <dd>{material}</dd>
              </>
            ) : null}
            <dt>Minimum order</dt>
            <dd>
              {product.minQuantity} {product.minQuantity === 1 || product.unit !== "piece" ? product.unit : "pieces"}
            </dd>
            {product.images.length > 1 ? (
              <>
                <dt>Designs</dt>
                <dd>{product.images.length} options — tap a photo</dd>
              </>
            ) : null}
            {product.maxQuantity ? (
              <>
                <dt>Maximum</dt>
                <dd>{product.maxQuantity}</dd>
              </>
            ) : null}
            {product.sku ? (
              <>
                <dt>SKU</dt>
                <dd>{product.sku}</dd>
              </>
            ) : null}
            <dt>Personalisation</dt>
            <dd>{isYes(attr(product, "Personal")) ? "Name / message available" : "Not available"}</dd>
            <dt>Packing</dt>
            <dd>Gift-ready with thank-you tag</dd>
            {product.taxPercent > 0 ? (
              <>
                <dt>Tax</dt>
                <dd>
                  {product.taxPercent}% {product.priceIncludesTax ? "included" : "extra"}
                </dd>
              </>
            ) : null}
          </dl>
          <div className="tags">
            {badge ? <span>{badge}</span> : null}
            {isYes(attr(product, "Useful")) ? <span>Everyday use</span> : null}
            {!product.inStock ? <span>Out of stock</span> : null}
          </div>
          <PriceTag product={product} />
          <div className="lb-add-wrap">
            <CartControls product={product} large />
          </div>
        </div>
      </div>
      {related.length > 0 ? (
        <section style={{ marginTop: 28 }}>
          <h2>More in {product.category?.name}</h2>
          <div className="grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
