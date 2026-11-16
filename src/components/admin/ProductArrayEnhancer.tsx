"use client";

import { useEffect } from "react";

const arrayKinds = [
  { includes: "Temel/Teknik", kind: "specs" },
  { includes: "Ürün Galerisi", kind: "gallery" },
  { includes: "Ürün Özellikleri", kind: "attributes" },
  { includes: "Üretilen Varyantlar", kind: "variants" },
  { includes: "Ambalaj ve Paketleme", kind: "packaging" },
  { includes: "Halka Açık Belgeler", kind: "publicDocs" },
  { includes: "Korumalı Belgeler", kind: "protectedDocs" },
  { includes: "Yetkili Kodlar", kind: "accessCodes" },
];

const annotateArrays = () => {
  document.querySelectorAll<HTMLElement>(".array-field").forEach((field) => {
    const heading = field.querySelector("h3")?.textContent || "";
    const match = arrayKinds.find((item) => heading.includes(item.includes));

    if (match) {
      field.dataset.ertipArray = match.kind;
    }
  });
};

export function ProductArrayEnhancer() {
  useEffect(() => {
    let frame = 0;

    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(annotateArrays);
    };

    schedule();

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
