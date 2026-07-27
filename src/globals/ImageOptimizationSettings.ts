import type { GlobalConfig } from "payload";
import { adminsOnly } from "@/access/roles";
import {
  DEFAULT_IMAGE_OPTIMIZATION_PROFILES,
  getCurrentImageOptimizationFingerprint,
} from "@/lib/imageOptimization/config";

function profileFields(
  profile: keyof typeof DEFAULT_IMAGE_OPTIMIZATION_PROFILES,
  label: string,
  description: string,
) {
  const defaults = DEFAULT_IMAGE_OPTIMIZATION_PROFILES[profile];

  return {
    name: profile,
    type: "group" as const,
    label,
    admin: {
      description,
    },
    fields: [
      {
        type: "row" as const,
        fields: [
          {
            name: "width",
            type: "number" as const,
            label: "Azami Genişlik (px)",
            required: true,
            defaultValue: defaults.width,
            min: 64,
            max: 3_840,
            admin: { width: "50%", step: 1 },
          },
          {
            name: "quality",
            type: "number" as const,
            label: "Kalite (40–95)",
            required: true,
            defaultValue: defaults.quality,
            min: 40,
            max: 95,
            admin: { width: "50%", step: 1 },
          },
        ],
      },
    ],
  };
}

export const ImageOptimizationSettings: GlobalConfig = {
  slug: "imageOptimization",
  label: "Görsel Optimizasyonu",
  admin: {
    group: "Site Yapılandırması",
    description:
      "Orijinal görselleri koruyarak site için kırpmasız WebP/AVIF türevleri üretin.",
  },
  access: {
    read: adminsOnly,
    update: adminsOnly,
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const merged = {
          ...(originalDoc || {}),
          ...(data || {}),
          profiles: {
            ...(originalDoc?.profiles || {}),
            ...(data?.profiles || {}),
            thumbnail: {
              ...(originalDoc?.profiles?.thumbnail || {}),
              ...(data?.profiles?.thumbnail || {}),
            },
            card: {
              ...(originalDoc?.profiles?.card || {}),
              ...(data?.profiles?.card || {}),
            },
            content: {
              ...(originalDoc?.profiles?.content || {}),
              ...(data?.profiles?.content || {}),
            },
            fullscreen: {
              ...(originalDoc?.profiles?.fullscreen || {}),
              ...(data?.profiles?.fullscreen || {}),
            },
          },
        };
        const nextFingerprint = getCurrentImageOptimizationFingerprint(merged);
        const previousFingerprint = originalDoc?.settingsFingerprint;
        const settingsChanged =
          Boolean(previousFingerprint) && previousFingerprint !== nextFingerprint;

        data.settingsFingerprint = nextFingerprint;

        if (!previousFingerprint && !data.optimizationStatus) {
          data.optimizationStatus = "idle";
        }

        if (settingsChanged) {
          data.optimizationStatus = "stale";
          data.activeFingerprint = null;
          data.optimizationRunId = null;
          data.processedCount = 0;
          data.skippedCount = 0;
          data.errorCount = 0;
          data.totalCount = 0;
          data.lastMessage =
            "Boyut veya kalite ayarları değişti. Yeni ayarları etkinleştirmek için tüm görselleri yeniden optimize edin.";
        }

        return data;
      },
    ],
  },
  fields: [
    {
      name: "enabled",
      type: "checkbox",
      label: "Optimize Edilmiş Görselleri Kullan",
      defaultValue: true,
      admin: {
        description:
          "Hazır bir optimizasyon çalışması varsa site üretilmiş türevleri kullanır. Kapalıyken orijinal görseller sunulur.",
      },
    },
    {
      name: "format",
      type: "select",
      label: "Çıktı Formatı",
      required: true,
      defaultValue: "webp",
      options: [
        {
          label: "WebP — Dengeli hız ve uyumluluk (önerilen)",
          value: "webp",
        },
        {
          label: "AVIF — Daha küçük dosya, daha yüksek işlemci maliyeti",
          value: "avif",
        },
      ],
    },
    {
      name: "profiles",
      type: "group",
      label: "Boyut ve Kalite Profilleri",
      admin: {
        description:
          "Görseller kırpılmaz; yalnızca en-boy oranı korunarak belirtilen azami genişliğe küçültülür.",
      },
      fields: [
        profileFields(
          "thumbnail",
          "Küçük Görseller",
          "Logo, avatar ve küçük önizleme alanları.",
        ),
        profileFields(
          "card",
          "Kart Görselleri",
          "Ürün kataloğu, haber ve benzeri kartlar.",
        ),
        profileFields(
          "content",
          "İçerik Görselleri",
          "Sayfa galerileri, ekip ve sertifika görselleri.",
        ),
        profileFields(
          "fullscreen",
          "Büyük / Tam Ekran Görseller",
          "Ürün detay ana görseli, hero ve lightbox görüntüleri.",
        ),
      ],
    },
    {
      name: "optimizerControl",
      type: "ui",
      admin: {
        components: {
          Field:
            "/components/admin/ImageOptimizationControl#ImageOptimizationControl",
        },
      },
    },
    {
      name: "settingsFingerprint",
      type: "text",
      admin: { hidden: true, readOnly: true },
    },
    {
      name: "activeFingerprint",
      type: "text",
      admin: { hidden: true, readOnly: true },
    },
    {
      name: "optimizationRunId",
      type: "text",
      admin: { hidden: true, readOnly: true },
    },
    {
      name: "optimizationStatus",
      type: "select",
      defaultValue: "idle",
      admin: { hidden: true, readOnly: true },
      options: [
        { label: "Bekliyor", value: "idle" },
        { label: "Ayarlar değişti", value: "stale" },
        { label: "İşleniyor", value: "running" },
        { label: "Hazır", value: "ready" },
        { label: "Kısmen tamamlandı", value: "partial" },
      ],
    },
    {
      name: "lastOptimizedAt",
      type: "date",
      admin: { hidden: true, readOnly: true },
    },
    {
      name: "processedCount",
      type: "number",
      defaultValue: 0,
      admin: { hidden: true, readOnly: true },
    },
    {
      name: "skippedCount",
      type: "number",
      defaultValue: 0,
      admin: { hidden: true, readOnly: true },
    },
    {
      name: "errorCount",
      type: "number",
      defaultValue: 0,
      admin: { hidden: true, readOnly: true },
    },
    {
      name: "totalCount",
      type: "number",
      defaultValue: 0,
      admin: { hidden: true, readOnly: true },
    },
    {
      name: "lastMessage",
      type: "textarea",
      admin: { hidden: true, readOnly: true },
    },
  ],
};
