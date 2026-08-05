import assert from "node:assert/strict";
import test from "node:test";
import { buildLocaleBootstrapPatch } from "../../src/lib/i18n/localeBootstrap";

test("copies missing English Page Builder content without overwriting translated fields", () => {
  const source = {
    id: 11,
    title: "Hakkımızda",
    slug: "hakkimizda",
    layout: [
      {
        id: "tr-hero-row",
        blockType: "hero",
        heading: "Ertip Medikal",
        buttons: [
          {
            id: "tr-button-row",
            label: "Ürünleri İncele",
            link: "/urunler",
          },
        ],
      },
    ],
    meta: {
      title: "Hakkımızda | Ertip Medikal",
      description: "Kurumsal sayfa",
    },
  };
  const target = {
    id: 11,
    title: "About Us",
    slug: "",
    layout: [],
    meta: null,
  };

  const patch = buildLocaleBootstrapPatch(source, target, {
    fields: ["title", "slug", "layout", "meta"],
    stripNestedIds: ["layout"],
  });

  assert.equal(patch.title, undefined);
  assert.equal(patch.slug, "hakkimizda");
  assert.deepEqual(patch.meta, source.meta);
  assert.deepEqual(patch.layout, [
    {
      blockType: "hero",
      heading: "Ertip Medikal",
      buttons: [
        {
          label: "Ürünleri İncele",
          link: "/urunler",
        },
      ],
    },
  ]);
});

test("preserves an existing English structure and only fills fields that are missing", () => {
  const englishLayout = [
    {
      id: "en-existing-row",
      blockType: "hero",
      heading: "Medical Solutions",
    },
  ];

  const patch = buildLocaleBootstrapPatch(
    {
      id: 22,
      title: "Ürün",
      slug: "urun",
      layout: [{ id: "tr-row", blockType: "hero", heading: "Türkçe" }],
    },
    {
      id: 22,
      title: "Product",
      slug: "product",
      layout: englishLayout,
    },
    {
      fields: ["title", "slug", "layout"],
      stripNestedIds: ["layout"],
    },
  );

  assert.deepEqual(patch, {});
  assert.equal(englishLayout[0]?.heading, "Medical Solutions");
});
