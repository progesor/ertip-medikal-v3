"use client";

import { useEffect } from "react";

const labels = [
  { includes: "Alt Bar Linkleri", kind: "links" },
  { includes: "Ambalaj ve Paketleme", kind: "packaging" },
  { includes: "Ana Slider", kind: "slides" },
  { includes: "Departmanlar", kind: "departments" },
  { includes: "Ekip Üyeleri", kind: "members" },
  { includes: "Etkinlik / Fuar Galerisi", kind: "gallery" },
  { includes: "Footer Sütunları", kind: "footerBlocks" },
  { includes: "Görseller", kind: "gallery" },
  { includes: "Halka Açık Belgeler", kind: "publicDocs" },
  { includes: "İletişim Konuları", kind: "departments" },
  { includes: "Logolar ve Sertifikalar", kind: "logos" },
  { includes: "Lokasyonlar", kind: "locations" },
  { includes: "Menü Linkleri", kind: "menuItems" },
  { includes: "Özellikler", kind: "features" },
  { includes: "Page Builder", kind: "pageBlocks" },
  { includes: "Rakamlar", kind: "stats" },
  { includes: "Sayfa Tasarım Blokları", kind: "pageBlocks" },
  { includes: "Sertifikalar", kind: "certificates" },
  { includes: "Slaytlar", kind: "slides" },
  { includes: "Sosyal Medya Linkleri", kind: "socialMedia" },
  { includes: "Sorular ve Cevaplar", kind: "questions" },
  { includes: "Sütun Linkleri", kind: "links" },
  { includes: "Talep Edilen Ürünler", kind: "quoteItems" },
  { includes: "Temel/Teknik", kind: "specs" },
  { includes: "Üretilen Varyantlar", kind: "variants" },
  { includes: "Ürün Galerisi", kind: "gallery" },
  { includes: "Ürün Özellikleri", kind: "attributes" },
  { includes: "Yetkili Kodlar", kind: "accessCodes" },
  { includes: "Yorumlar", kind: "testimonials" },
];

const setScreenMeta = () => {
  const { documentElement } = document;
  const { pathname } = window.location;

  delete documentElement.dataset.ertipAdminScreen;
  delete documentElement.dataset.ertipAdminCollection;

  if (pathname === "/admin" || pathname === "/admin/") {
    documentElement.dataset.ertipAdminScreen = "dashboard";
    return;
  }

  if (pathname.includes("/admin/login")) {
    documentElement.dataset.ertipAdminScreen = "login";
    return;
  }

  const collectionMatch = pathname.match(/\/admin\/collections\/([^/?#]+)/);
  if (collectionMatch) {
    documentElement.dataset.ertipAdminCollection = collectionMatch[1];
    documentElement.dataset.ertipAdminScreen = pathname.split("/").length > 5
      ? "collection-edit"
      : "collection-list";
    return;
  }

  const globalMatch = pathname.match(/\/admin\/globals\/([^/?#]+)/);
  if (globalMatch) {
    documentElement.dataset.ertipAdminCollection = globalMatch[1];
    documentElement.dataset.ertipAdminScreen = "global-edit";
  }
};

const detectFieldKind = (field: HTMLElement) => {
  if (field.querySelector(".checkbox-input, input[type='checkbox']")) {
    return "checkbox";
  }

  if (field.querySelector(".react-select, select")) {
    return "select";
  }

  if (field.querySelector(".upload")) {
    return "upload";
  }

  if (field.querySelector(".rich-text, .lexical-editor, [class*='lexical']")) {
    return "richtext";
  }

  if (field.querySelector("textarea")) {
    return "textarea";
  }

  if (field.querySelector("[class*='relationship']")) {
    return "relationship";
  }

  if (field.querySelector("input")) {
    return "input";
  }

  return "generic";
};

const annotate = () => {
  setScreenMeta();

  document.querySelectorAll<HTMLElement>(".array-field, .blocks-field").forEach((field) => {
    const heading =
      field.querySelector("h3")?.textContent ||
      field.querySelector("label")?.textContent ||
      "";
    const match = labels.find((item) => heading.includes(item.includes));

    if (match) {
      field.dataset.ertipArray = match.kind;
    }
  });

  document.querySelectorAll<HTMLElement>(".group-field").forEach((group) => {
    const heading = group.querySelector("h3, label")?.textContent || "";
    if (heading) group.dataset.ertipGroup = "true";
  });

  document.querySelectorAll<HTMLElement>(".blocks-field .collapsible").forEach((block) => {
    const pill = block.querySelector<HTMLElement>("[class*='blocks-field__block-pill']");
    if (pill?.textContent) {
      block.dataset.ertipBlock = pill.textContent.trim();
    }
  });

  document.querySelectorAll<HTMLElement>(".field-type").forEach((field) => {
    const kind = detectFieldKind(field);
    field.dataset.ertipFieldKind = kind;

    const isWide =
      kind === "textarea" ||
      kind === "upload" ||
      kind === "richtext" ||
      field.querySelector(".array-field, .blocks-field") !== null;

    if (isWide) {
      field.dataset.ertipWide = "true";
    } else {
      delete field.dataset.ertipWide;
    }
  });
};

export function AdminSurfaceEnhancer() {
  useEffect(() => {
    let frame = 0;

    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(annotate);
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
