import { PolicyDocument } from "@/components/policy-document";
import { policyBySlug } from "@/lib/policies";
import type { Metadata } from "next";

const policy = policyBySlug("returns")!;

export const metadata: Metadata = {
  title: policy.title,
  description: policy.description,
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  return <PolicyDocument policy={policy} />;
}
