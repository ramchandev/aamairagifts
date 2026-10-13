import { PolicyDocument } from "@/components/policy-document";
import { policyBySlug } from "@/lib/policies";
import type { Metadata } from "next";

const policy = policyBySlug("terms")!;

export const metadata: Metadata = {
  title: policy.title,
  description: policy.description,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <PolicyDocument policy={policy} />;
}
