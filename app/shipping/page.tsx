import { PolicyDocument } from "@/components/policy-document";
import { policyBySlug } from "@/lib/policies";
import type { Metadata } from "next";

const policy = policyBySlug("shipping")!;

export const metadata: Metadata = {
  title: policy.title,
  description: policy.description,
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return <PolicyDocument policy={policy} />;
}
