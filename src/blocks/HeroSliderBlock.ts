import { Block } from "payload";

export const HeroSliderBlock: Block = {
  slug: "heroSlider",
  labels: { singular: "Ana Slider", plural: "Ana Sliderlar" },
  fields: [
    {
      name: "slides",
      type: "array",
      label: "Slaytlar",
      minRows: 1,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: "/components/admin/AdminArrayRowLabel#AdminArrayRowLabel",
        },
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: false,
          label: "Arkaplan Görseli",
        },
        { name: "title", type: "text", label: "Ana Başlık", required: true },
        { name: "subtitle", type: "textarea", label: "Alt Metin" },
        {
          type: "row",
          fields: [
            {
              name: "buttonText",
              type: "text",
              label: "Buton Yazısı",
              admin: { width: "50%" },
            },
            {
              name: "buttonLink",
              type: "text",
              label: "Buton Linki",
              admin: { width: "50%" },
            },
          ],
        },
        {
          name: "overlayOpacity",
          type: "select",
          label: "Karartma Oranı (Yazı Okunabilirliği İçin)",
          defaultValue: "0.4",
          options: [
            { label: "%20", value: "0.2" },
            { label: "%40", value: "0.4" },
            { label: "%60", value: "0.6" },
          ],
        },
      ],
    },
  ],
};
