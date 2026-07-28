import type { Field } from "payload";
import { DEFAULT_MAX_VARIANT_COMBINATIONS } from "@/lib/sku-engine/configuration";
import {
  DEFAULT_SKU_TEMPLATE,
  DEFAULT_SKU_VALUE_SEPARATOR,
} from "@/lib/sku-engine/templateProfile";

const templateOnly = (
  _data: Record<string, unknown>,
  siblingData: Record<string, unknown>,
) => siblingData.skuRuleProfile === "template";

const automaticProfileOnly = (
  _data: Record<string, unknown>,
  siblingData: Record<string, unknown>,
) => siblingData.skuRuleProfile !== "manual";

export const skuRuleFields: Field[] = [
  {
    type: "row",
    fields: [
      {
        name: "skuRuleProfile",
        type: "select",
        required: true,
        defaultValue: "legacy-punch",
        label: "SKU Kural Profili",
        options: [
          {
            label: "Ertip Punch — doğrulanmış çap/uzunluk kuralı",
            value: "legacy-punch",
          },
          {
            label: "Şablon — genel amaçlı yapılandırılabilir SKU",
            value: "template",
          },
          {
            label: "Manuel — otomatik üretim kapalı",
            value: "manual",
          },
        ],
        admin: {
          width: "65%",
          description:
            "Punch ürünlerinde doğrulanmış profili, diğer ürün ailelerinde Şablon profilini kullanın.",
        },
      },
      {
        name: "maxVariantCombinations",
        type: "number",
        required: true,
        defaultValue: DEFAULT_MAX_VARIANT_COMBINATIONS,
        min: 1,
        max: 5000,
        label: "Maksimum Kombinasyon",
        admin: {
          width: "35%",
          condition: automaticProfileOnly,
          description:
            "Yanlış veri girişinde çok fazla varyant oluşmasını engelleyen ürün bazlı güvenlik sınırı.",
        },
      },
    ],
  },
  {
    name: "skuTemplate",
    type: "text",
    required: true,
    defaultValue: DEFAULT_SKU_TEMPLATE,
    label: "SKU Şablonu",
    admin: {
      condition: templateOnly,
      description:
        "Belirteçler: {prefix}, {suffix}, {values}, {value:Özellik Adı}, {raw:Özellik Adı}.",
    },
  },
  {
    type: "row",
    fields: [
      {
        name: "skuValueSeparator",
        type: "text",
        required: true,
        defaultValue: DEFAULT_SKU_VALUE_SEPARATOR,
        label: "{values} Ayıracı",
        admin: {
          width: "40%",
          condition: templateOnly,
          description: "Örnek: -, / veya boş değer.",
        },
      },
      {
        name: "skuValueNormalization",
        type: "select",
        required: true,
        defaultValue: "compact",
        label: "Değer Normalizasyonu",
        options: [
          { label: "Aynen kullan", value: "none" },
          { label: "Kompakt", value: "compact" },
          { label: "Büyük harf kompakt", value: "uppercase-compact" },
          { label: "Slug", value: "slug" },
        ],
        admin: {
          width: "60%",
          condition: templateOnly,
        },
      },
    ],
  },
  {
    name: "skuRuleWorkbench",
    type: "ui",
    admin: {
      components: {
        Field: "/components/admin/SkuRuleWorkbench#SkuRuleWorkbench",
      },
    },
  },
];

export function enhanceVariantTabField(field: Field): Field {
  if (field.type === "row") {
    return {
      ...field,
      fields: field.fields.map((nestedField) => {
        if (
          "name" in nestedField &&
          nestedField.name === "skuSuffix" &&
          nestedField.type === "text"
        ) {
          return {
            ...nestedField,
            admin: {
              ...nestedField.admin,
              description:
                "Son ek aynen kullanılır. Boşluk isteniyorsa başına boşluk ekleyin: “ S-303”.",
            },
          };
        }

        return nestedField;
      }),
    };
  }

  if (
    "name" in field &&
    field.name === "triggerVariantGeneration" &&
    field.type === "checkbox"
  ) {
    return {
      ...field,
      label: "Kaydederken Varyantları Yeniden Üret",
      admin: {
        ...field.admin,
        condition: automaticProfileOnly,
        description:
          "Önizleme kullanmadan doğrudan üretim yapmak için işaretleyin. Hata oluşursa mevcut varyantlar değiştirilmez.",
      },
    };
  }

  if (
    "name" in field &&
    field.name === "variants" &&
    field.type === "array"
  ) {
    return {
      ...field,
      fields: [
        {
          name: "combinationKey",
          type: "text",
          label: "Mantıksal Kombinasyon Kimliği",
          admin: {
            hidden: true,
            readOnly: true,
          },
        },
        ...field.fields,
      ],
    };
  }

  return field;
}

export function enhanceProductFields(fields: Field[]): Field[] {
  return fields.map((field) => {
    if (field.type !== "tabs") return field;

    return {
      ...field,
      tabs: field.tabs.map((tab) => {
        if (tab.label !== "Varyantlar ve Stok") return tab;

        return {
          ...tab,
          fields: [
            ...skuRuleFields,
            ...tab.fields.map(enhanceVariantTabField),
          ],
        };
      }),
    };
  });
}