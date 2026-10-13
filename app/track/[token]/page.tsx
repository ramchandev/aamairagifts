import { redirect } from "next/navigation";

export default async function TrackTokenRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ phone?: string }>;
}) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  const phone = query.phone?.trim();
  const target = phone
    ? `/order/${encodeURIComponent(token)}?phone=${encodeURIComponent(phone)}`
    : `/order/${encodeURIComponent(token)}`;
  redirect(target);
}
