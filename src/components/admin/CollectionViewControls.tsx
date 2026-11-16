"use client";

import { Grid2X2, LayoutGrid, List, Rows3, Table2 } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

type ViewMode = "table" | "list" | "cards" | "grid" | "compact";

const viewModes: Array<{
  description: string;
  icon: ComponentType<{ size?: number }>;
  label: string;
  value: ViewMode;
}> = [
  {
    description: "Standart kolonlu tablo",
    icon: Table2,
    label: "Tablo",
    value: "table",
  },
  {
    description: "Okunabilir satır listesi",
    icon: List,
    label: "Liste",
    value: "list",
  },
  {
    description: "Tek kolon kart görünümü",
    icon: Rows3,
    label: "Kart",
    value: "cards",
  },
  {
    description: "Çok kolonlu grid görünümü",
    icon: Grid2X2,
    label: "Grid",
    value: "grid",
  },
  {
    description: "Yoğun veri görünümü",
    icon: LayoutGrid,
    label: "Kompakt",
    value: "compact",
  },
];

const getEffectiveMode = (selectedMode: ViewMode) => {
  if (typeof window === "undefined") return selectedMode;
  if (window.innerWidth <= 900 && selectedMode !== "table") return "table";
  return selectedMode;
};

const normalizeHeading = (text: string) =>
  {
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
  const pathname = usePathname();
  const collectionSlug = pathname.split("/collections/")[1]?.split("/")[0] || "collection";
  const storageKey = `ertip-admin-view:${collectionSlug}`;
  const readMode = useCallback((): ViewMode => {
    const saved = window.localStorage.getItem(storageKey);
    return viewModes.find((item) => item.value === saved)?.value || "table";
  }, [storageKey]);
  const mode = useSyncExternalStore(subscribeToMode, readMode, () => "table" as const);
  const [viewportMode, setViewportMode] = useState<ViewMode>("table");
  const [rowCount, setRowCount] = useState(0);


  useEffect(() => {
    const syncMode = () => setViewportMode(getEffectiveMode(mode));
    syncMode();
    window.addEventListener("resize", syncMode);

    return () => {
      window.removeEventListener("resize", syncMode);
    };
  }, [mode]);

  useEffect(() => {
    document.documentElement.dataset.ertipCollectionView = viewportMode;

    return () => {
      delete document.documentElement.dataset.ertipCollectionView;
    };
  }, [viewportMode]);

  useEffect(() => {
    let frame = 0;

    const annotateTable = () => {
      window.cancelAnimationFrame(frame);

      frame = window.requestAnimationFrame(() => {
        const table = document.querySelector<HTMLTableElement>(
          ".collection-list .table table",
        );

        if (!table) {
          setRowCount(0);
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
            return cell.querySelector("a, strong, [class*='cell-link']") !== null;
          });
          const primaryIndex = detectedPrimaryIndex >= 1 ? detectedPrimaryIndex : 1;

          cells.forEach((cell, index) => {
            const label = headings[index] || "Alan";

            cell.setAttribute("data-label", label);
            cell.toggleAttribute("data-primary", index === primaryIndex);
            cell.toggleAttribute("data-utility", index === 0);
          });
        });

        setRowCount(rows.length);
      });
    };

    annotateTable();

    const list = document.querySelector(".collection-list");
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
  }, [collectionSlug]);

  return (
    <section className="ertip-collection-tools" aria-label="Liste görünümü">
      <div className="ertip-collection-tools__meta">
        <span>Görünüm</span>
        <strong>{rowCount > 0 ? `${rowCount} kayıt` : "Kayıt görünümü"}</strong>
      </div>

      <div className="ertip-collection-tools__modes" role="group">
        {viewModes.map((item) => {
          const Icon = item.icon;
          const isActive = mode === item.value;

          return (
            <button
              aria-pressed={isActive}
              className="ertip-collection-tools__button"
              key={item.value}
              onClick={() => {
                window.localStorage.setItem(storageKey, item.value);
                window.dispatchEvent(new Event("ertip-view-mode"));
              }}
              title={item.description}
              type="button"
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
