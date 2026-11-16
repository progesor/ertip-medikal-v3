"use client";

import {
  BarChart3,
  Bell,
  BookOpenText,
  Building2,
  FileText,
  HelpCircle,
  Image,
  LayoutTemplate,
  MapPin,
  Megaphone,
  MessageSquareQuote,
  MousePointerClick,
  Newspaper,
  PackageSearch,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useFormFields } from "@payloadcms/ui";

type Props = {
  blockType?: string;
  path?: string;
  rowLabel?: string;
  rowNumber?: number;
};

const textValue = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : "";

const blockLabels = {
  certificateGrid: {
    icon: ShieldCheck,
    label: "Sertifika galerisi",
    titleKeys: ["title"],
  },
  contactForm: {
    icon: Building2,
    label: "İletişim ve talep",
    titleKeys: ["title", "formTitle"],
  },
  content: {
    icon: BookOpenText,
    label: "Metin içeriği",
    titleKeys: [],
  },
  cta: {
    icon: MousePointerClick,
    label: "Aksiyon alanı",
    titleKeys: ["title", "buttonText"],
  },
  faq: {
    icon: HelpCircle,
    label: "S.S.S.",
    titleKeys: ["title"],
  },
  featuredProducts: {
    icon: PackageSearch,
    label: "Öne çıkan ürünler",
    titleKeys: ["title", "selectionType"],
  },
  features: {
    icon: Sparkles,
    label: "Özellik kartları",
    titleKeys: ["title", "subtitle"],
  },
  gallery: {
    icon: Image,
    label: "Galeri",
    titleKeys: ["title"],
  },
  hero: {
    icon: LayoutTemplate,
    label: "Hero alanı",
    titleKeys: ["heading", "subheading"],
  },
  heroSlider: {
    icon: Image,
    label: "Ana slider",
    titleKeys: ["title"],
  },
  location: {
    icon: MapPin,
    label: "Lokasyon",
    titleKeys: ["title"],
  },
  logoSlider: {
    icon: ShieldCheck,
    label: "Logo bandı",
    titleKeys: ["title"],
  },
  newsFeed: {
    icon: Newspaper,
    label: "Haber akışı",
    titleKeys: ["title", "description"],
  },
  newsletter: {
    icon: Bell,
    label: "Bülten kayıt",
    titleKeys: ["title", "buttonText"],
  },
  process: {
    icon: BarChart3,
    label: "Süreç",
    titleKeys: ["title"],
  },
  stats: {
    icon: BarChart3,
    label: "İstatistik",
    titleKeys: ["title"],
  },
  team: {
    icon: Users,
    label: "Ekip",
    titleKeys: ["title"],
  },
  testimonial: {
    icon: MessageSquareQuote,
    label: "Müşteri yorumu",
    titleKeys: ["title"],
  },
  textColumn: {
    icon: FileText,
    label: "Footer metin sütunu",
    titleKeys: ["text"],
  },
  menuColumn: {
    icon: Megaphone,
    label: "Footer menü sütunu",
    titleKeys: ["title"],
  },
  contactColumn: {
    icon: Building2,
    label: "Footer iletişim sütunu",
    titleKeys: ["title"],
  },
} as const;

export function AdminBlockRowLabel({ blockType, path = "", rowLabel, rowNumber = 0 }: Props) {
  const summary = useFormFields(([fields]) => {
    const detectedType =
      blockType || textValue(fields[`${path}.blockType`]?.value) || "content";
    const config = blockLabels[detectedType as keyof typeof blockLabels];
    const title = config?.titleKeys
      .map((key) => textValue(fields[`${path}.${key}`]?.value))
      .find(Boolean);

    return {
      config,
      detectedType,
      title,
    };
  });

  const Icon = summary.config?.icon || FileText;
  const label = summary.config?.label || rowLabel || summary.detectedType;
  const title = summary.title || rowLabel || `${label} ${rowNumber + 1}`;

  return (
    <span className="ertip-block-row-label">
      <Icon size={16} />
      <span>
        <strong>{title}</strong>
        <small>{label}</small>
      </span>
    </span>
  );
}
