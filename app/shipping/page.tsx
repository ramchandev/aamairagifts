import { PolicyDocument } from "@/components/policy-document";
import { pageMeta } from "@/lib/seo";
import { policyBySlug } from "@/lib/policies";

const policy = policyBySlug("shipping")!;

export const metadata = pageMeta({
  title: policy.title,
  description: policy.description,
  path: "/shipping",
});

export default function ShippingPage() {
  return <PolicyDocument policy={policy} />;
}
