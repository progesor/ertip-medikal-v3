import assert from "node:assert/strict";
import test from "node:test";
import { deepMerge } from "payload/shared";

test("Payload merges own data without inheriting a supplied prototype", () => {
  const malicious = JSON.parse('{"__proto__":{"isAdmin":true},"title":"Page"}');
  for (const result of [
    deepMerge(Object.create(null), malicious),
    deepMerge(malicious, {}),
    deepMerge({ entry: null }, { entry: malicious }).entry,
  ]) {
    assert.equal(Object.getPrototypeOf(result), Object.prototype);
    assert.equal(result.isAdmin, undefined);
    assert.equal(result.title, "Page");
  }
});
