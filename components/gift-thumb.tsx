import Image from "next/image";
import type { Thumb } from "@/lib/product-thumbs";

export function GiftThumb({ thumb, name, size = 52 }: { thumb: Thumb | null; name: string; size?: number }) {
  if (!thumb) return <span className="gift-thumb empty" style={{ width: size, height: size }} aria-hidden="true" />;
  return (
    <span className="gift-thumb" style={{ width: size, height: size }}>
      <Image src={thumb.url} alt={thumb.alt || name} width={size} height={size} />
    </span>
  );
}
