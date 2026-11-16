"use client";

import { Grid2X2, LayoutGrid, List, Rows3, Table2 } from "lucide-react";
import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";

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

const getCollectionSlug = () => {
  if (typeof window === "undefined") return "collection";

  const [, slug] =
    window.location.pathname.match(/\/admin\/collections\/([^/?#]+)/) || [];

  return slug || "collection";
};

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

export function CollectionViewControls() {
  const [collectionSlug, setCollectionSlug] = useState("collection");
  const [mode, setMode] = useState<ViewMode>("table");
  const [viewportMode, setViewportMode] = useState<ViewMode>("table");
  const [rowCount, setRowCount] = useState(0);

  const storageKey = useMemo(
    () => `ertip-admin-view:${collectionSlug}`,
    [collectionSlug],
  );

  useEffect(() => {
    const slug = getCollectionSlug();
    setCollectionSlug(slug);

    const savedMode = window.localStorage.getItem(
      `ertip-admin-view:${slug}`,
    ) as ViewMode | null;

    if (savedMode && viewModes.some((item) => item.value === savedMode)) {
      setMode(savedMode);
    }
  }, []);

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
    window.localStorage.setItem(storageKey, mode);

    return () => {
      delete document.documentElement.dataset.ertipCollectionView;
    };
  }, [mode, storageKey, viewportMode]);

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
              onClick={() => setMode(item.value)}
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
