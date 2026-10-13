import { PolicyDocument } from "@/components/policy-document";
import { policyBySlug } from "@/lib/policies";
import type { Metadata } from "next";

const policy = policyBySlug("privacy")!;

export const metadata: Metadata = {
  title: policy.title,
  description: policy.description,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <PolicyDocument policy={policy} />;
}
