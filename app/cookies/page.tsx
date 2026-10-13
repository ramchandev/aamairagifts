import { PolicyDocument } from "@/components/policy-document";
import { policyBySlug } from "@/lib/policies";
import type { Metadata } from "next";

const policy = policyBySlug("cookies")!;

export const metadata: Metadata = {
  title: policy.title,
  description: policy.description,
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return <PolicyDocument policy={policy} />;
}
