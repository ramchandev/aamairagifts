import { PolicyDocument } from "@/components/policy-document";
import { pageMeta } from "@/lib/seo";
import { policyBySlug } from "@/lib/policies";

const policy = policyBySlug("terms")!;

export const metadata = pageMeta({
  title: policy.title,
  description: policy.description,
  path: "/terms",
});

export default function TermsPage() {
  return <PolicyDocument policy={policy} />;
}
