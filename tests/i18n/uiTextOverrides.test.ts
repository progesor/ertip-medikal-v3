import assert from "node:assert/strict";
import test from "node:test";
import {
  getUiTextDefaultValue,
  normalizeUiTextOverrides,
} from "../../src/lib/i18n/uiTextOverrides";

test("keeps only allowed non-empty UI text overrides", () => {
  const normalized = normalizeUiTextOverrides({
    "quote.title": "  Özel Teklif Başlığı  ",
    "product.addToQuoteCart": "Özel Buton",
    "product.accessDenied": "Bu teknik alan admin tarafından değişmemeli",
    "unknown.key": "ignored",
    "contact.submit": "   ",
    "quote.description": 123,
  });

  assert.deepEqual(normalized, {
    "quote.title": "Özel Teklif Başlığı",
    "product.addToQuoteCart": "Özel Buton",
  });
});

test("returns locale-specific typed dictionary values as editor fallbacks", () => {
  assert.equal(getUiTextDefaultValue("tr", "quote.title"), "Teklif Sepeti");
  assert.equal(getUiTextDefaultValue("en", "quote.title"), "Quote Cart");
  assert.equal(
    getUiTextDefaultValue("en", "product.addToQuoteCart"),
    "Add to Quote Cart",
  );
});
