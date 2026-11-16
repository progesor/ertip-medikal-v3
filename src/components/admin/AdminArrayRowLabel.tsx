"use client";

import {
  Building2,
  HelpCircle,
  Image,
  Link2,
  ListChecks,
  MapPin,
  MessageSquareQuote,
  PackageSearch,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { useFormFields, useRowLabel } from "@payloadcms/ui";

type RowData = Record<string, unknown>;

const textValue = (value: unknown) => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Aktif" : "Pasif";
  return "";
};

const firstText = (data: RowData, keys: string[]) => {
  for (const key of keys) {
    const value = textValue(data[key]);
    if (value) return value;
  }

  return "";
};

const getRowIndex = (path: string, rowNumber?: number) => {
  if (typeof rowNumber === "number") return rowNumber + 1;

  const index = [...path.split(".")].reverse().find((part) => /^\d+$/.test(part));
  return index ? Number(index) + 1 : 1;
};

const getKind = (path: string) => {
  if (path.includes("slides")) return "slides";
  if (path.includes("features")) return "features";
  if (path.includes("questions")) return "questions";
  if (path.includes("stats")) return "stats";
  if (path.includes("certificates")) return "certificates";
  if (path.includes("departments")) return "departments";
  if (path.includes("locations")) return "locations";
  if (path.includes("members")) return "members";
  if (path.includes("testimonials")) return "testimonials";
  if (path.includes("logos")) return "logos";
  if (path.includes("images") || path.includes("gallery")) return "images";
  if (path.includes("buttons")) return "buttons";
  if (path.includes("items")) return "items";
  if (path.includes("socialMedia")) return "socialMedia";
  if (path.includes("bottomLinks") || path.includes("links")) return "links";
  return "default";
};

export function AdminArrayRowLabel() {
  const { data, path, rowNumber } = useRowLabel<RowData>();
  const row = useFormFields(([fields]) => {
    const merged: RowData = { ...(data || {}) };

    [
      "address",
      "answer",
      "buttonText",
      "code",
      "content",
      "description",
      "featureDescription",
      "featureTitle",
      "issuer",
      "label",
      "link",
      "name",
      "phone",
      "platform",
      "productTitle",
      "question",
      "quantity",
      "role",
      "sku",
      "stepNumber",
      "subtitle",
      "title",
      "url",
      "value",
      "variantInfo",
    ].forEach((key) => {
      const fieldValue = fields[`${path}.${key}`]?.value;
      if (fieldValue !== undefined) merged[key] = fieldValue;
    });

    return merged;
  });

  const index = getRowIndex(path, rowNumber);
  const kind = getKind(path);

  const definitionsByKind = {
    buttons: {
      icon: Link2,
      meta: firstText(row, ["link", "url"]) || "Aksiyon linki",
      title: firstText(row, ["label", "buttonText"]) || `Buton ${index}`,
    },
    certificates: {
      icon: ShieldCheck,
      meta: firstText(row, ["issuer", "description"]) || "Sertifika kaydı",
      title: firstText(row, ["name", "title"]) || `Sertifika ${index}`,
    },
    default: {
      icon: ListChecks,
      meta: "İçerik satırı",
      title: firstText(row, ["title", "label", "name"]) || `Satır ${index}`,
    },
    departments: {
      icon: Building2,
      meta: "Form seçim konusu",
      title: firstText(row, ["label", "name"]) || `Departman ${index}`,
    },
    features: {
      icon: Sparkles,
      meta: firstText(row, ["featureDescription", "description"]) || "Özellik kartı",
      title: firstText(row, ["featureTitle", "title"]) || `Özellik ${index}`,
    },
    images: {
      icon: Image,
      meta: "Görsel içerik",
      title: firstText(row, ["caption", "alt", "label"]) || `Görsel ${index}`,
    },
    items: {
      icon: PackageSearch,
      meta:
        [firstText(row, ["variantInfo"]), firstText(row, ["sku"]), firstText(row, ["quantity"]) && `${firstText(row, ["quantity"])} adet`]
          .filter(Boolean)
          .join(" / ") || firstText(row, ["url", "type"]) || "Liste öğesi",
      title: firstText(row, ["productTitle", "label", "title"]) || `Öğe ${index}`,
    },
    links: {
      icon: Link2,
      meta: firstText(row, ["url", "link"]) || "Bağlantı",
      title: firstText(row, ["label", "title"]) || `Link ${index}`,
    },
    locations: {
      icon: MapPin,
      meta: firstText(row, ["address", "phone", "email"]) || "Lokasyon bilgisi",
      title: firstText(row, ["title", "name"]) || `Lokasyon ${index}`,
    },
    logos: {
      icon: Star,
      meta: "Logo / sertifika görseli",
      title: firstText(row, ["label", "title", "name"]) || `Logo ${index}`,
    },
    members: {
      icon: Users,
      meta: firstText(row, ["role", "linkedin"]) || "Ekip profili",
      title: firstText(row, ["name"]) || `Ekip üyesi ${index}`,
    },
    questions: {
      icon: HelpCircle,
      meta: firstText(row, ["answer"]) || "Cevap bekleniyor",
      title: firstText(row, ["question"]) || `Soru ${index}`,
    },
    slides: {
      icon: Image,
      meta: firstText(row, ["subtitle", "buttonText"]) || "Slider slaytı",
      title: firstText(row, ["title"]) || `Slayt ${index}`,
    },
    socialMedia: {
      icon: Link2,
      meta: firstText(row, ["url"]) || "Sosyal medya profili",
      title: firstText(row, ["platform", "label"]) || `Sosyal kanal ${index}`,
    },
    stats: {
      icon: Star,
      meta: firstText(row, ["label"]) || "İstatistik etiketi",
      title: firstText(row, ["value"]) || `Rakam ${index}`,
    },
    testimonials: {
      icon: MessageSquareQuote,
      meta: firstText(row, ["content"]) || "Yorum metni",
      title: firstText(row, ["name", "title"]) || `Yorum ${index}`,
    },
  };

  const definitions =
    definitionsByKind[kind as keyof typeof definitionsByKind] ||
    definitionsByKind.default;

  const Icon = definitions.icon;

  return (
    <span className="ertip-array-row-label">
      <Icon size={16} />
      <span>
        <strong>{definitions.title}</strong>
        <small>{definitions.meta}</small>
      </span>
    </span>
  );
}
