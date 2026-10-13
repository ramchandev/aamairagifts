import { PolicyDocument } from "@/components/policy-document";
import { pageMeta } from "@/lib/seo";
import { policyBySlug } from "@/lib/policies";

const policy = policyBySlug("returns")!;

export const metadata = pageMeta({
  title: policy.title,
  description: policy.description,
  path: "/returns",
});

export default function ReturnsPage() {
  return <PolicyDocument policy={policy} />;
}
