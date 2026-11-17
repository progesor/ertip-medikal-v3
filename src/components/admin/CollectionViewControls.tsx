"use client";

import { useListQuery } from "@payloadcms/ui";
import { CollectionQuickFilters } from "./CollectionQuickFilters";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

type ViewMode = "table" | "list" | "cards" | "grid" | "compact";

const viewModes: { label: string; value: ViewMode }[] = [
  { label: "Tablo", value: "table" },
  { label: "Liste", value: "list" },
  { label: "Kart", value: "cards" },
  { label: "Izgara", value: "grid" },
  { label: "Sık tablo", value: "compact" },
];

const normalizeHeading = (text: string) => {
  const label = text
    .replace(/select-all/gi, "")
    .replace(/Sort by.+?(Ascending|Descending)/gi, "")
    .replace(/\(.+?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!label) return "Alan";
  if (/ürün adı|urun adi/i.test(label)) return "Ürün";
  if (/ana ürün kodu|ana urun kodu|sku/i.test(label)) return "Ana SKU";
  if (/status|durum/i.test(label)) return "Durum";
  if (/created|oluştur/i.test(label)) return "Oluşturma";
  if (/updated|güncelle/i.test(label)) return "Güncelleme";
  if (/published|yayın/i.test(label)) return "Yayın";

  return label.length > 30 ? `${label.slice(0, 27)}...` : label;
};

function subscribeToMode(update: () => void) {
  window.addEventListener("storage", update);
  window.addEventListener("ertip-view-mode", update);
  return () => {
    window.removeEventListener("storage", update);
    window.removeEventListener("ertip-view-mode", update);
  };
}

export function CollectionViewControls() {
  const { collectionSlug, data, orderableFieldName, isGroupingBy } =
    useListQuery();
  const allowModes =
    !orderableFieldName && !isGroupingBy && collectionSlug !== "products";
  const storageKey = `ertip-admin-view:${collectionSlug}`;
  const readMode = useCallback((): ViewMode => {
    const saved = window.localStorage.getItem(storageKey);
    return viewModes.find((item) => item.value === saved)?.value || "table";
  }, [storageKey]);
  const preference = useSyncExternalStore(
    subscribeToMode,
    readMode,
    () => "table" as const,
  );
  const controlsRef = useRef<HTMLElement>(null);
  const mode = allowModes ? preference : "table";

  useEffect(() => {
    const list = controlsRef.current?.closest<HTMLElement>(".collection-list");
    if (!list) return;
    list.dataset.ertipCollectionView = mode;
    return () => {
      delete list.dataset.ertipCollectionView;
    };
  }, [mode, collectionSlug]);

  useEffect(() => {
    if (mode === "table" || mode === "compact") return;
    const list = controlsRef.current?.closest(".collection-list");
    if (!list) return;
    let frame = 0;

    const annotateTable = () => {
      window.cancelAnimationFrame(frame);

      frame = window.requestAnimationFrame(() => {
        const table = list.querySelector<HTMLTableElement>(".table table");

        if (!table) {
          return;
        }

        const headings = Array.from(table.querySelectorAll("thead th")).map(
          (heading) => normalizeHeading(heading.textContent || ""),
        );

        const rows = Array.from(table.querySelectorAll("tbody tr"));

        rows.forEach((row) => {
          const cells = Array.from(row.children);
          const detectedPrimaryIndex = cells.findIndex((cell, index) => {
            if (index === 0) return false;
            return (
              cell.querySelector("a, strong, [class*='cell-link']") !== null
            );
          });
          const primaryIndex =
            detectedPrimaryIndex >= 1 ? detectedPrimaryIndex : 1;

          cells.forEach((cell, index) => {
            const label = headings[index] || "Alan";

            cell.setAttribute("data-label", label);
            cell.toggleAttribute("data-primary", index === primaryIndex);
            cell.toggleAttribute("data-utility", index === 0);
          });
        });
      });
    };

    annotateTable();

    const observer = new MutationObserver(annotateTable);

    if (list) {
      observer.observe(list, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [collectionSlug, mode]);

  return (
    <section
      ref={controlsRef}
      className="ertip-collection-tools"
      aria-label="Liste görünümü"
    >
      <CollectionQuickFilters />
      <div className="ertip-list-options">
        {data && (
          <small aria-live="polite">
            {data.totalDocs.toLocaleString("tr-TR")} kayıt
          </small>
        )}
        {allowModes && (
          <label>
            Görünüm
            <select
              value={mode}
              onChange={(event) => {
                window.localStorage.setItem(storageKey, event.target.value);
                window.dispatchEvent(new Event("ertip-view-mode"));
              }}
            >
              {viewModes.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </section>
  );
}
