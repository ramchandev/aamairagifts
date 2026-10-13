import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { POLICIES, type Policy } from "@/lib/policies";
import { breadcrumbLd } from "@/lib/seo";

export function PolicyDocument({ policy }: { policy: Policy }) {
  return (
    <main className="wrap legal">
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: policy.title, path: `/${policy.slug}` }])} />
      <p className="crumb">
        <Link href="/">Home</Link>
        {" / "}
        <span>{policy.title}</span>
      </p>
      <article>
        <h1>{policy.title}</h1>
        {policy.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.blocks.map((block, index) =>
              block.type === "list" ? (
                <ul key={index}>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p key={index}>{block.text}</p>
              ),
            )}
          </section>
        ))}
      </article>
      <nav className="legal-more" aria-label="Other policies">
        {POLICIES.filter((item) => item.slug !== policy.slug).map((item) => (
          <Link key={item.slug} href={`/${item.slug}`}>
            {item.title}
          </Link>
        ))}
      </nav>
    </main>
  );
}
