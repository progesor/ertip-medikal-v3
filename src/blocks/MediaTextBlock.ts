import type { Block } from "payload";

export const MediaTextBlock: Block = {
  slug: "mediaText",
  labels: {
    singular: "Görsel ve Metin",
    plural: "Görsel ve Metin Blokları",
  },
  fields: [
    {
      name: "eyebrow",
      type: "text",
      label: "Küçük Üst Başlık",
      admin: {
        placeholder: "Örn: Kurumsal Hikâyemiz",
        description:
          "Ana başlığın üzerinde küçük vurgu metni olarak gösterilir.",
      },
    },
    {
      name: "title",
      type: "text",
      required: true,
      label: "Ana Başlık",
    },
    {
      name: "content",
      type: "richText",
      required: true,
      label: "İçerik",
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Görsel (Opsiyonel)",
      admin: {
        description:
          "Görsel seçilmezse blok otomatik olarak gelişmiş bir metin bölümüne dönüşür.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "layoutMode",
          type: "select",
          label: "Yerleşim Biçimi",
          defaultValue: "split",
          options: [
            { label: "İki Sütun", value: "split" },
            {
              label: "Metin Görselin Etrafında Aksın",
              value: "wrap",
            },
          ],
        },
        {
          name: "columnRatio",
          type: "select",
          label: "Görsel / Metin Oranı",
          defaultValue: "equal",
          options: [
            {
              label: "Görsel 1/3 — Metin 2/3",
              value: "mediaOneThird",
            },
            { label: "Görsel 1/2 — Metin 1/2", value: "equal" },
            {
              label: "Görsel 2/3 — Metin 1/3",
              value: "mediaTwoThird",
            },
          ],
        },
        {
          name: "imagePosition",
          type: "select",
          label: "Görsel Konumu",
          defaultValue: "left",
          options: [
            { label: "Solda", value: "left" },
            { label: "Sağda", value: "right" },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "verticalAlignment",
          type: "select",
          label: "Dikey Hizalama",
          defaultValue: "center",
          options: [
            { label: "Üstten Hizala", value: "start" },
            { label: "Ortala", value: "center" },
          ],
        },
        {
          name: "imageFit",
          type: "select",
          label: "Görsel Yerleşimi",
          defaultValue: "cover",
          options: [
            { label: "Alanı Doldur", value: "cover" },
            { label: "Görselin Tamamını Göster", value: "contain" },
          ],
        },
        {
          name: "imageRatio",
          type: "select",
          label: "Görsel Çerçeve Oranı",
          defaultValue: "landscape",
          options: [
            { label: "Görselin Kendi Oranı", value: "auto" },
            { label: "Yatay 4:3", value: "landscape" },
            { label: "Geniş 16:9", value: "wide" },
            { label: "Kare 1:1", value: "square" },
            { label: "Dikey 3:4", value: "portrait" },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "contentWidth",
          type: "select",
          label: "İçerik Genişliği",
          defaultValue: "standard",
          options: [
            { label: "Dar", value: "compact" },
            { label: "Standart", value: "standard" },
            { label: "Geniş", value: "wide" },
            { label: "Tam Genişlik", value: "full" },
          ],
          admin: {
            description:
              "Görselsiz ve metin-akışlı yerleşimlerde içerik genişliğini belirler.",
          },
        },
        {
          name: "contentAlignment",
          type: "select",
          label: "Görselsiz İçerik Hizası",
          defaultValue: "left",
          options: [
            { label: "Sola Hizalı", value: "left" },
            { label: "Ortalanmış", value: "center" },
          ],
        },
        {
          name: "theme",
          type: "select",
          label: "Arka Plan Teması",
          defaultValue: "light",
          options: [
            { label: "Açık", value: "light" },
            { label: "Yumuşak Gri", value: "muted" },
            { label: "Koyu", value: "dark" },
          ],
        },
      ],
    },
    {
      name: "highlight",
      type: "textarea",
      label: "Vurgu Kutusu (Opsiyonel)",
      admin: {
        description:
          "Kısa bir kurumsal mesaj veya önemli bilgi için kullanılır.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "buttonText",
          type: "text",
          label: "Buton Metni (Opsiyonel)",
        },
        {
          name: "buttonLink",
          type: "text",
          label: "Buton Bağlantısı (Opsiyonel)",
          admin: { placeholder: "/iletisim" },
        },
      ],
    },
  ],
};
