import { PolicyDocument } from "@/components/policy-document";
import { pageMeta } from "@/lib/seo";
import { policyBySlug } from "@/lib/policies";

const policy = policyBySlug("privacy")!;

export const metadata = pageMeta({
  title: policy.title,
  description: policy.description,
  path: "/privacy",
});

export default function PrivacyPage() {
  return <PolicyDocument policy={policy} />;
}
