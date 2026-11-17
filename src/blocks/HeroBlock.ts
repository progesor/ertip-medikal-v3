import type { Block } from "payload";
import { sectionField } from "@/fields/section";

export const HeroBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero Alanı", plural: "Hero Alanları" },
  fields: [
    {
      name: "eyebrow",
      type: "text",
      label: "Küçük Üst Başlık (Opsiyonel)",
    },
    { name: "heading", type: "text", required: true, label: "Ana Başlık" },
    { name: "subheading", type: "textarea", label: "Alt Başlık / Açıklama" },
    {
      name: "backgroundImage",
      type: "upload",
      relationTo: "media",
      label: "Masaüstü arka planı (görsel veya video)",
      filterOptions: { or: [{ mimeType: { contains: "image/" } }, { mimeType: { contains: "video/" } }] },
    },
    {
      name: "mobileBackgroundImage",
      type: "upload",
      relationTo: "media",
      label: "Mobil görsel / video kapak karesi",
      filterOptions: { mimeType: { contains: "image/" } },
      admin: {
        description:
          "Masaüstünde video seçtiğinizde mobil cihazlarda ve azaltılmış hareket tercihinde gösterilecek kareyi yükleyin.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "height",
          type: "select",
          label: "Hero Yüksekliği",
          defaultValue: "standard",
          options: [
            { label: "Kompakt", value: "compact" },
            { label: "Standart", value: "standard" },
            { label: "Büyük", value: "large" },
            { label: "Ekran Odaklı", value: "screen" },
          ],
        },
        {
          name: "contentAlignment",
          type: "select",
          label: "İçerik Hizası",
          defaultValue: "center",
          options: [
            { label: "Sol", value: "left" },
            { label: "Orta", value: "center" },
            { label: "Sağ", value: "right" },
          ],
        },
        {
          name: "contentWidth",
          type: "select",
          label: "Metin Genişliği",
          defaultValue: "standard",
          options: [
            { label: "Dar", value: "compact" },
            { label: "Standart", value: "standard" },
            { label: "Geniş", value: "wide" },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "theme",
          type: "select",
          label: "Renk Teması",
          defaultValue: "primary",
          options: [
            { label: "Marka Rengi", value: "primary" },
            { label: "Koyu", value: "dark" },
            { label: "Açık", value: "light" },
          ],
        },
        {
          name: "overlayOpacity",
          type: "select",
          label: "Görsel Karartma Yoğunluğu",
          defaultValue: "medium",
          options: [
            { label: "Hafif", value: "low" },
            { label: "Orta", value: "medium" },
            { label: "Güçlü", value: "high" },
          ],
        },
        {
          name: "imageFocus",
          type: "select",
          label: "Görsel Odak Noktası",
          defaultValue: "center",
          options: [
            { label: "Merkez", value: "center" },
            { label: "Üst", value: "top" },
            { label: "Alt", value: "bottom" },
            { label: "Sol", value: "left" },
            { label: "Sağ", value: "right" },
          ],
        },
      ],
    },
    {
      name: "showBreadcrumb",
      type: "checkbox",
      label: "İç Sayfalarda Breadcrumb Göster",
      defaultValue: false,
    },
    {
      name: "buttons",
      type: "array",
      maxRows: 2,
      labels: { singular: "Buton", plural: "Butonlar" },
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: "/components/admin/AdminArrayRowLabel#AdminArrayRowLabel",
        },
      },
      fields: [
        { name: "label", type: "text", required: true, label: "Buton Metni" },
        { name: "link", type: "text", required: true, label: "Bağlantı" },
        {
          name: "style",
          type: "select",
          label: "Buton Stili",
          defaultValue: "solid",
          options: [
            { label: "Dolgulu", value: "solid" },
            { label: "İkincil", value: "secondary" },
            { label: "Çerçeveli", value: "outline" },
          ],
        },
      ],
    },
    sectionField({
      background: "transparent",
      spacing: "none",
      contentWidth: "full",
    }),
  ],
};
