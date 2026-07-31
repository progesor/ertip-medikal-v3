import type { Field } from "payload";

type SectionDefaults = {
  background?: "transparent" | "light" | "muted" | "dark" | "primary";
  spacing?: "none" | "compact" | "standard" | "large";
  contentWidth?: "compact" | "standard" | "wide" | "full";
};

export function sectionField(defaults: SectionDefaults = {}): Field {
  return {
    name: "section",
    type: "group",
    label: "Bölüm Görünümü",
    fields: [
      {
        name: "anchor",
        type: "text",
        label: "Bölüm Kimliği / Anchor (Opsiyonel)",
        admin: {
          placeholder: "ornek-bolum",
          description:
            "Sayfa içi bağlantılarda kullanılacak benzersiz kimlik. Boşluk kullanmayın.",
        },
      },
      {
        type: "row",
        fields: [
          {
            name: "background",
            type: "select",
            label: "Arka Plan",
            defaultValue: defaults.background ?? "transparent",
            options: [
              { label: "Şeffaf", value: "transparent" },
              { label: "Açık", value: "light" },
              { label: "Yumuşak Gri", value: "muted" },
              { label: "Koyu", value: "dark" },
              { label: "Marka Rengi", value: "primary" },
            ],
          },
          {
            name: "spacing",
            type: "select",
            label: "Dikey Boşluk",
            defaultValue: defaults.spacing ?? "standard",
            options: [
              { label: "Yok", value: "none" },
              { label: "Kompakt", value: "compact" },
              { label: "Standart", value: "standard" },
              { label: "Geniş", value: "large" },
            ],
          },
          {
            name: "contentWidth",
            type: "select",
            label: "İçerik Genişliği",
            defaultValue: defaults.contentWidth ?? "wide",
            options: [
              { label: "Dar", value: "compact" },
              { label: "Standart", value: "standard" },
              { label: "Geniş", value: "wide" },
              { label: "Tam Genişlik", value: "full" },
            ],
          },
        ],
      },
      {
        type: "row",
        fields: [
          {
            name: "dividerTop",
            type: "checkbox",
            label: "Üst Ayırıcı",
            defaultValue: false,
          },
          {
            name: "dividerBottom",
            type: "checkbox",
            label: "Alt Ayırıcı",
            defaultValue: false,
          },
          {
            name: "decoration",
            type: "select",
            label: "Dekoratif Arka Plan",
            defaultValue: "none",
            options: [
              { label: "Yok", value: "none" },
              { label: "Yumuşak Işık", value: "glow" },
              { label: "İnce Izgara", value: "grid" },
            ],
          },
        ],
      },
    ],
  };
}
