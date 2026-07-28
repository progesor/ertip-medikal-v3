import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLegacyPunchSku,
  buildLegacyPunchSkuCode,
  buildLegacyVariantTitle,
  createCombinationKey,
  parseLegacyAttributes,
} from "../../src/lib/sku-engine/legacyPunch";

const attributes = parseLegacyAttributes([
  { name: "Çap", values: "0.6-0.65" },
  { name: "Uzunluk", values: "1.5-20" },
]);

const canonicalDiameters = [
  "0.6",
  "0.65",
  "0.7",
  "0.75",
  "0.8",
  "0.85",
  "0.9",
  "0.95",
  "1.0",
  "1.2",
  "1.3",
] as const;

const canonicalPunchMatrix = [
  {
    length: "2.5",
    expected: [
      "625",
      "6525",
      "725",
      "7525",
      "825",
      "8525",
      "925",
      "9525",
      "1025",
      "1225",
      "1325",
    ],
  },
  {
    length: "3.0",
    expected: [
      "063",
      "653",
      "073",
      "753",
      "083",
      "853",
      "093",
      "953",
      "103",
      "123",
      "133",
    ],
  },
  {
    length: "3.5",
    expected: [
      "635",
      "6535",
      "735",
      "7535",
      "835",
      "8535",
      "935",
      "9535",
      "1035",
      "1235",
      "1335",
    ],
  },
  {
    length: "4.0",
    expected: [
      "064",
      "654",
      "074",
      "754",
      "084",
      "854",
      "094",
      "954",
      "104",
      "124",
      "134",
    ],
  },
  {
    length: "5.0",
    expected: [
      "065",
      "655",
      "075",
      "755",
      "085",
      "855",
      "095",
      "955",
      "105",
      "125",
      "135",
    ],
  },
] as const;

test("parses legacy hyphen-separated attributes", () => {
  assert.deepEqual(attributes, [
    { name: "Çap", values: ["0.6", "0.65"] },
    { name: "Uzunluk", values: ["1.5", "20"] },
  ]);
});

test("keeps the historical fractional-length Punch SKU behavior", () => {
  assert.equal(buildLegacyPunchSkuCode(attributes, ["0.6", "1.5"]), "615");
  assert.equal(
    buildLegacyPunchSkuCode(attributes, ["0.65", "1.5"]),
    "6515",
  );
});

test("normalizes trailing-zero lengths as integer measurements", () => {
  assert.equal(buildLegacyPunchSkuCode(attributes, ["0.65", "3.0"]), "653");
  assert.equal(buildLegacyPunchSkuCode(attributes, ["0.6", "4.0"]), "064");
});

test("matches the canonical 55-entry Ertip Punch SKU matrix", () => {
  for (const row of canonicalPunchMatrix) {
    assert.deepEqual(
      canonicalDiameters.map((diameter) =>
        buildLegacyPunchSkuCode(attributes, [diameter, row.length]),
      ),
      row.expected,
      `Unexpected SKU row for ${row.length} mm length`,
    );
  }
});

test("keeps leading diameter zero for one-decimal sub-1 diameters with integer lengths", () => {
  assert.equal(buildLegacyPunchSkuCode(attributes, ["0.6", "20"]), "0620");
  assert.equal(buildLegacyPunchSkuCode(attributes, ["0.65", "20"]), "6520");
});

test("keeps fallback concatenation for non-Punch attributes", () => {
  const fallbackAttributes = parseLegacyAttributes([
    { name: "Renk", values: "Mavi" },
    { name: "Model", values: "A.1" },
  ]);
  assert.equal(
    buildLegacyPunchSkuCode(fallbackAttributes, ["Mavi", "A.1"]),
    "MaviA1",
  );
});

test("preserves legacy title and prefix formatting", () => {
  assert.equal(
    buildLegacyVariantTitle(attributes, ["0.6", "20"]),
    "0.6 mm Çap - 20 mm Uzunluk",
  );
  assert.equal(
    buildLegacyPunchSku(attributes, ["0.6", "20"], "110-", ""),
    "110-0620",
  );
});

test("uses suffix spacing exactly as entered by the administrator", () => {
  assert.equal(
    buildLegacyPunchSku(attributes, ["0.6", "20"], "110-", "S-303"),
    "110-0620S-303",
  );
  assert.equal(
    buildLegacyPunchSku(attributes, ["0.6", "20"], "110-", " S-303"),
    "110-0620 S-303",
  );
  assert.equal(
    buildLegacyPunchSku(attributes, ["0.6", "20"], "110-", "-303"),
    "110-0620-303",
  );
});

test("creates a deterministic logical combination key", () => {
  assert.equal(
    createCombinationKey(attributes, ["0.6", "20"]),
    '[["Çap","0.6"],["Uzunluk","20"]]',
  );
});
