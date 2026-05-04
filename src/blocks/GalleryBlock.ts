import { Block } from "payload";

export const GalleryBlock: Block = {
  slug: "gallery",
  labels: { singular: "Galeri Bloğu", plural: "Galeri Blokları" },
  fields: [
    { name: "title", type: "text", label: "Galeri Başlığı" },
    {
      name: "galleryLayout",
      type: "select",
      label: "Galeri Yerleşimi",
      defaultValue: "mosaic",
      options: [
        { label: "Mozaik", value: "mosaic" },
        { label: "Grid", value: "grid" },
        { label: "Masonry", value: "masonry" },
        { label: "Öne Çıkan", value: "featured" },
      ],
    },
    {
      name: "images",
      type: "array",
      label: "Görseller",
      minRows: 2,
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
      ],
    },
  ],
};
