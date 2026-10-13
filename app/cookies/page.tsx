import { PolicyDocument } from "@/components/policy-document";
import { pageMeta } from "@/lib/seo";
import { policyBySlug } from "@/lib/policies";

const policy = policyBySlug("cookies")!;

export const metadata = pageMeta({
  title: policy.title,
  description: policy.description,
  path: "/cookies",
});

export default function CookiesPage() {
  return <PolicyDocument policy={policy} />;
}
