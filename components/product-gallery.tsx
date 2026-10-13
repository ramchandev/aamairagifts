"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [index, setIndex] = useState(0);
  const image = images[index];

  return (
    <div className="gallery">
      <div className="lb-img">{image ? <Image src={image.url} alt={image.alt ?? name} fill priority sizes="(max-width: 900px) 100vw, 55vw" /> : null}</div>
      {images.length > 1 ? (
        <div className="lb-thumbs" aria-label={`${name} photos`}>
          {images.map((item, itemIndex) => (
            <button key={item.id} type="button" aria-label={`${name} photo ${itemIndex + 1}`} aria-pressed={itemIndex === index} onClick={() => setIndex(itemIndex)}>
              <Image src={item.url} alt="" fill sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
