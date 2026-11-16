"use client";

import {
  BarChart3,
  Blocks,
  FileText,
  Image,
  LayoutTemplate,
  MousePointerClick,
  Newspaper,
  PackageSearch,
  ShieldCheck,
} from "lucide-react";
import { useFormFields } from "@payloadcms/ui";

type FormField = {
  value?: unknown;
};

type BlockRow = {
  blockName?: string;
  blockType?: string;
  heading?: string;
  title?: string;
};

const blockConfig = {
  certificateGrid: { icon: ShieldCheck, label: "Sertifika" },
  contactForm: { icon: MousePointerClick, label: "Talep" },
  content: { icon: FileText, label: "Metin" },
  cta: { icon: MousePointerClick, label: "CTA" },
  faq: { icon: FileText, label: "SSS" },
  featuredProducts: { icon: PackageSearch, label: "Ürün vitrini" },
  features: { icon: Blocks, label: "Özellik" },
  gallery: { icon: Image, label: "Galeri" },
  hero: { icon: LayoutTemplate, label: "Hero" },
  heroSlider: { icon: Image, label: "Slider" },
  location: { icon: LayoutTemplate, label: "Lokasyon" },
  logoSlider: { icon: ShieldCheck, label: "Logo bandı" },
  newsFeed: { icon: Newspaper, label: "Haber" },
  newsletter: { icon: MousePointerClick, label: "Bülten" },
  process: { icon: BarChart3, label: "Süreç" },
  stats: { icon: BarChart3, label: "Rakam" },
  team: { icon: Blocks, label: "Ekip" },
  testimonial: { icon: FileText, label: "Yorum" },
} as const;

const asText = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : "";

const asRows = (value: unknown): BlockRow[] => (Array.isArray(value) ? value : []);

const rowsFromFields = (fields: Record<string, FormField>) => {
  const rows: Record<number, BlockRow> = {};

  Object.entries(fields).forEach(([path, field]) => {
    const match = path.match(/^layout\.(\d+)\.(blockName|blockType|heading|title)$/);
    if (!match) return;

    const index = Number(match[1]);
    const key = match[2] as keyof BlockRow;
    rows[index] = {
      ...(rows[index] || {}),
      [key]: asText(field.value),
    };
  });

  return Object.keys(rows)
    .map(Number)
    .sort((a, b) => a - b)
    .map((index) => rows[index]);
};

export function PageBuilderStudio() {
  const data = useFormFields(([fields]) => {
    const get = (path: string) => fields[path] as FormField | undefined;
    const layoutValue = asRows(get("layout")?.value);
    const layout = layoutValue.length ? layoutValue : rowsFromFields(fields);
    const types = layout.reduce<Record<string, number>>((acc, row) => {
      const type = row.blockType || "content";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      layout,
      title: asText(get("title")?.value),
      types,
    };
  });

  return (
    <section className="ertip-studio ertip-page-studio" aria-label="Sayfa düzeni">
      <div className="ertip-studio__header">
        <span>Sayfa Mimarı</span>
        <strong>{data.title || "Yeni sayfa"}</strong>
      </div>

      <div className="ertip-studio__stats">
        <span>
          <strong>{data.layout.length}</strong>
          <small>Blok</small>
        </span>
        <span>
          <strong>{Object.keys(data.types).length}</strong>
          <small>Tip</small>
        </span>
        <span>
          <strong>{data.types.heroSlider || data.types.hero || 0}</strong>
          <small>Hero</small>
        </span>
      </div>

      <div className="ertip-page-map">
        {data.layout.length ? (
          data.layout.map((row, index) => {
            const type = row.blockType || "content";
            const config =
              blockConfig[type as keyof typeof blockConfig] || blockConfig.content;
            const Icon = config.icon;
            const title =
              row.blockName || row.title || row.heading || `${config.label} bloğu`;

            return (
              <article key={`${type}-${index}`} className="ertip-page-map__item">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <Icon size={16} />
                <div>
                  <strong>{title}</strong>
                  <small>{config.label}</small>
                </div>
              </article>
            );
          })
        ) : (
          <article className="ertip-page-map__empty">
            <Blocks size={18} />
            <strong>Blok eklenmedi</strong>
          </article>
        )}
      </div>
    </section>
  );
}
